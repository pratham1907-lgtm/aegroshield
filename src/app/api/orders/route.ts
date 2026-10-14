import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const firebaseUid = searchParams.get('firebaseUid');
  const userId = searchParams.get('userId');

  try {
    let targetUserId: string | null = null;
    const lookupKey = firebaseUid || userId;

    if (lookupKey) {
      // 1. Check if lookupKey is a Postgres user primary id
      try {
        const userById = await prisma.user.findUnique({
          where: { id: lookupKey },
        });
        if (userById) {
          targetUserId = userById.id;
        }
      } catch (err) {
        // Continue to firebaseUid lookup
      }

      // 2. Check if lookupKey is a firebaseUid
      if (!targetUserId) {
        try {
          const userByFb = await prisma.user.findUnique({
            where: { firebaseUid: lookupKey },
          });
          if (userByFb) {
            targetUserId = userByFb.id;
          }
        } catch (err) {
          console.warn('[API/Orders] User lookup error:', err);
        }
      }
    }

    if (targetUserId) {
      const userOrders = await prisma.order.findMany({
        where: { userId: targetUserId },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: userOrders, source: 'postgres' });
    }

    // Default: fetch latest orders
    const allOrders = await prisma.order.findMany({
      take: 25,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: allOrders, source: 'postgres' });
  } catch (error: any) {
    console.error('[API/Orders] GET error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const body = await request.json();
    console.log("Incoming Order Payload:", body);

    const {
      customerName,
      customerPhone,
      shippingAddress,
      district,
      pincode,
      paymentMethod,
      items,
      totalAmount,
    } = body;

    const deliveryAddress = (shippingAddress || '').trim();
    if (!deliveryAddress) {
      throw new HttpError('Delivery shipping address is required.', 400);
    }

    const orderCustomerName = (customerName || user.name || 'AgriShield Farmer').trim();
    const orderCustomerPhone = (customerPhone || user.phone || '').trim();

    if (!orderCustomerName || !orderCustomerPhone) {
      throw new HttpError('Full name and phone number are required for order delivery.', 400);
    }

    // Parse items if passed as stringified JSON or an array
    let rawItems = items;
    if (typeof rawItems === 'string') {
      try {
        rawItems = JSON.parse(rawItems);
      } catch (err) {
        console.warn('[API/Orders] Warning parsing stringified items:', err);
      }
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new HttpError('Cannot create an order with an empty cart.', 400);
    }

    // Normalize each item to guarantee { productId, title, price, quantity, image }
    const normalizedItems = rawItems.map((item: any) => ({
      productId: String(item.productId || item.id || ''),
      title: String(item.title || item.name || 'Product'),
      price: Number(item.price || item.unitPrice || 0),
      quantity: Number(item.quantity || 1),
      image: String(item.image || item.imageUrl || ''),
      // Secondary fields for compatibility
      id: String(item.id || item.productId || ''),
      name: String(item.name || item.title || 'Product'),
      category: String(item.category || 'General'),
      brand: String(item.brand || ''),
      unit: String(item.unit || 'unit'),
      vendorId: String(item.vendorId || ''),
    }));

    // Compute or validate totalAmount using normalizedItems
    const computedTotal = normalizedItems.reduce((sum: number, item: any) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);

    const deliveryCharge = computedTotal >= 500 ? 0 : 50;
    const finalTotal = Number(totalAmount || (computedTotal + deliveryCharge));

    // Persist order in Supabase PostgreSQL bound to authenticated user.id
    const createdOrder = await prisma.order.create({
      data: {
        userId: user.id,
        items: normalizedItems,
        totalAmount: finalTotal,
        status: 'PENDING',
        shippingAddress: `${deliveryAddress}${district ? `, ${district}` : ''}${pincode ? ` - ${pincode}` : ''}`,
        customerName: orderCustomerName,
        customerPhone: orderCustomerPhone,
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

    console.log("REAL_ORDER_CREATED:", createdOrder.id);

    return NextResponse.json(
      {
        success: true,
        data: createdOrder,
        message: 'Order created and persisted successfully in Supabase database!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Creation Error:", error);
    return handleAuthError(error);
  }
}

