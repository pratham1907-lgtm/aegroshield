import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      userId,
      firebaseUid,
    } = body;

    if (!customerName || !customerPhone || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Full name, phone number, and delivery address are required.' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, error: 'Cannot create an order with an empty cart.' },
        { status: 400 }
      );
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

    // Resolve or auto-create User record for this customer
    let user = null;
    const cleanPhone = customerPhone ? String(customerPhone).trim() : null;
    const cleanName = customerName ? String(customerName).trim() : 'AgriShield Farmer';
    const lookupKey = firebaseUid || userId;

    // 1. Look up user by phone if available
    if (cleanPhone) {
      try {
        user = await prisma.user.findFirst({ where: { phone: cleanPhone } });
      } catch (err) {
        console.warn('[API/Orders] Phone lookup warning:', err);
      }
    }

    // 2. Look up user by lookupKey (id or firebaseUid) if not found by phone
    if (!user && lookupKey && typeof lookupKey === 'string' && lookupKey.trim() !== '') {
      try {
        user = (await prisma.user.findUnique({ where: { id: lookupKey } })) ||
               (await prisma.user.findUnique({ where: { firebaseUid: lookupKey } }));
      } catch (err) {
        console.warn('[API/Orders] User ID lookup warning:', err);
      }
    }

    // 3. If user doesn't exist, create a new User record for this farmer
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            name: cleanName,
            phone: cleanPhone,
            role: 'FARMER',
            ...(lookupKey ? { firebaseUid: lookupKey } : {}),
          },
        });
      } catch (createErr) {
        console.warn('[API/Orders] Auto user creation warning:', createErr);
      }
    }

    // 4. Fallback: Seeded Demo User ID or any existing user in DB
    if (!user) {
      try {
        user =
          (await prisma.user.findFirst({ where: { isDemo: true } })) ||
          (await prisma.user.findFirst());

        if (!user) {
          user = await prisma.user.upsert({
            where: { firebaseUid: 'demo-farmer-seller-uid' },
            update: {},
            create: {
              firebaseUid: 'demo-farmer-seller-uid',
              email: 'demo@aegroshield.com',
              name: 'Demo Account (Kisan Seva Kendra)',
              role: 'FARMER',
              isDemo: true,
            },
          });
        }
      } catch (demoErr) {
        console.error("ORDER_CREATE_ERROR (Demo User Fallback):", demoErr);
      }
    }

    if (!user) {
      console.error("ORDER_CREATE_ERROR: Could not resolve or seed a user account for this order.");
      return NextResponse.json(
        { success: false, error: 'Could not resolve user account for this order.' },
        { status: 500 }
      );
    }

    const targetUserId = user.id;

    // Compute or validate totalAmount using normalizedItems
    const computedTotal = normalizedItems.reduce((sum: number, item: any) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);

    const deliveryCharge = computedTotal >= 500 ? 0 : 50;
    const finalTotal = Number(totalAmount || (computedTotal + deliveryCharge));

    // Persist order in Supabase PostgreSQL with explicit try-catch logging
    try {
      const createdOrder = await prisma.order.create({
        data: {
          userId: targetUserId,
          items: normalizedItems,
          totalAmount: finalTotal,
          status: 'PENDING',
          shippingAddress: `${shippingAddress}${district ? `, ${district}` : ''}${pincode ? ` - ${pincode}` : ''}`,
          customerName: cleanName,
          customerPhone: cleanPhone || '',
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
    } catch (createError: any) {
      console.error("ORDER_CREATE_ERROR:", createError);
      return NextResponse.json(
        {
          success: false,
          error: createError?.message || 'Database error: Failed to insert order into Supabase',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("ORDER_CREATE_ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to place order in database',
      },
      { status: 500 }
    );
  }
}
