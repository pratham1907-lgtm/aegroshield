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

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot create an order with an empty cart.' },
        { status: 400 }
      );
    }

    let targetUserId: string | null = null;
    const lookupKey = firebaseUid || userId;

    if (lookupKey) {
      // 1. Check if lookupKey is a valid Postgres User ID
      try {
        const userById = await prisma.user.findUnique({
          where: { id: lookupKey },
        });
        if (userById) {
          targetUserId = userById.id;
        }
      } catch (err) {
        // Continue to firebaseUid check
      }

      // 2. Check if lookupKey is a firebaseUid
      if (!targetUserId) {
        try {
          const userByFb = await prisma.user.findUnique({
            where: { firebaseUid: lookupKey },
          });
          if (userByFb) {
            targetUserId = userByFb.id;
          } else {
            // Auto-create user row in PostgreSQL for this firebaseUid
            const createdUser = await prisma.user.create({
              data: {
                firebaseUid: lookupKey,
                name: customerName || 'AgriShield Farmer',
                phone: customerPhone || null,
                role: 'FARMER',
                isDemo: false,
              },
            });
            targetUserId = createdUser.id;
          }
        } catch (fbErr) {
          console.warn('[API/Orders] User lookup/create by firebaseUid error:', fbErr);
        }
      }
    }

    // 3. Fallback to existing demo user or any user in DB so order is never lost
    if (!targetUserId) {
      try {
        const defaultUser =
          (await prisma.user.findFirst({ where: { isDemo: true } })) ||
          (await prisma.user.findFirst());

        if (defaultUser) {
          targetUserId = defaultUser.id;
        } else {
          const demoUser = await prisma.user.upsert({
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
          targetUserId = demoUser.id;
        }
      } catch (demoErr) {
        console.warn('[API/Orders] Demo user fallback error:', demoErr);
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Could not resolve user account for this order.' },
        { status: 400 }
      );
    }

    // Compute or validate totalAmount
    const computedTotal = items.reduce((sum: number, item: any) => {
      const price = Number(item.price || item.unitPrice || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);

    const deliveryCharge = computedTotal >= 500 ? 0 : 50;
    const finalTotal = Number(totalAmount || (computedTotal + deliveryCharge));

    // Persist order in Supabase PostgreSQL
    const createdOrder = await prisma.order.create({
      data: {
        userId: targetUserId,
        items: items,
        totalAmount: finalTotal,
        status: 'PENDING',
        shippingAddress: `${shippingAddress}${district ? `, ${district}` : ''}${pincode ? ` - ${pincode}` : ''}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
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

    return NextResponse.json(
      {
        success: true,
        data: createdOrder,
        message: 'Order created and persisted successfully in Supabase database!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API/Orders] Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to place order in database',
      },
      { status: 500 }
    );
  }
}
