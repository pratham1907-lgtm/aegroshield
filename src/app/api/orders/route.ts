import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';
import { createOrderSchema, formatZodError } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);

    const viewAsSeller =
      searchParams.get('asSeller') === 'true' ||
      searchParams.get('role') === 'seller' ||
      searchParams.get('seller') === 'true';

    if (viewAsSeller) {
      const seller = user.sellers?.[0];
      if (!seller || !seller.isVerified) {
        throw new HttpError('Forbidden: Active verified seller account required to view seller orders.', 403);
      }

      // Fetch orders and filter where order items contain products belonging to this seller
      const allOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      });

      const sellerOrders = allOrders.filter(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        return items.some((item: any) => item.sellerId === seller.id);
      });

      return NextResponse.json({ success: true, data: sellerOrders, source: 'postgres' });
    }

    // Default Customer Order History: strictly limited to the authenticated user's ID
    const userOrders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: userOrders, source: 'postgres' });
  } catch (error: any) {
    console.error('[API/Orders] GET error:', error);
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      throw new HttpError('Invalid JSON request body', 400);
    }

    // Parse items if passed as stringified JSON
    if (typeof rawBody.items === 'string') {
      try {
        rawBody.items = JSON.parse(rawBody.items);
      } catch {
        throw new HttpError('Invalid items JSON format', 400);
      }
    }

    // Validate inputs using Zod
    const validationResult = createOrderSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: formatZodError(validationResult.error),
          details: validationResult.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerPhone,
      shippingAddress,
      district,
      pincode,
      paymentMethod,
      items,
    } = validationResult.data;

    // Use prisma.$transaction to atomically:
    // a) Read each product from database, verify it exists and is active
    // b) Atomically decrement stock only where stock >= quantity (fail with 409 Conflict if stock is insufficient)
    // c) Calculate subtotal, delivery charge, and final totalAmount on the server using authoritative database prices
    // d) Create the Order record
    const createdOrder = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const normalizedItems: Array<{
        productId: string;
        name: string;
        title: string;
        price: number;
        unitPrice: number;
        quantity: number;
        unit: string;
        category: string;
        image: string;
        imageUrl: string | null;
        sellerId: string;
      }> = [];

      for (const item of items) {
        // a) Read product from DB
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { seller: true },
        });

        if (!product) {
          throw new HttpError(`Product not found with ID: ${item.productId}`, 404);
        }

        // b) Atomically decrement stock only where stock >= quantity
        const updateResult = await tx.product.updateMany({
          where: {
            id: product.id,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updateResult.count === 0) {
          throw new HttpError(
            `Insufficient stock for "${product.name}". Available stock is less than requested quantity (${item.quantity}).`,
            409
          );
        }

        const authoritativePrice = Number(product.price);
        subtotal += authoritativePrice * item.quantity;

        normalizedItems.push({
          productId: product.id,
          name: product.name,
          title: product.name,
          price: authoritativePrice,
          unitPrice: authoritativePrice,
          quantity: item.quantity,
          unit: product.unit || 'unit',
          category: product.category || 'General',
          image: product.imageUrl || '',
          imageUrl: product.imageUrl,
          sellerId: product.sellerId,
        });
      }

      // c) Calculate authoritative subtotal, delivery fee, and finalTotal
      const deliveryCharge = subtotal >= 500 ? 0 : 50;
      const finalTotal = subtotal + deliveryCharge;

      // d) Create Order record
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          items: normalizedItems,
          totalAmount: finalTotal,
          status: 'PENDING',
          shippingAddress: `${shippingAddress}${district ? `, ${district}` : ''}${pincode ? ` - ${pincode}` : ''}`,
          customerName: customerName,
          customerPhone: customerPhone,
          district: district || 'Uttar Pradesh',
          pincode: pincode || '250001',
          paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
        },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      });

      return newOrder;
    });

    console.log("SECURE_ORDER_CREATED:", createdOrder.id, "Total:", createdOrder.totalAmount);

    return NextResponse.json(
      {
        success: true,
        data: createdOrder,
        message: 'Order created and persisted successfully in Supabase database!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API/Orders] POST error:', error);
    return handleAuthError(error);
  }
}


