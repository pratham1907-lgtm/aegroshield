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
      // 1. Try finding by primary Postgres user ID
      const userById = await prisma.user.findUnique({
        where: { id: lookupKey },
      });
      if (userById) {
        targetUserId = userById.id;
      } else {
        // 2. Try finding by firebaseUid
        const userByFb = await prisma.user.findUnique({
          where: { firebaseUid: lookupKey },
        });
        if (userByFb) {
          targetUserId = userByFb.id;
        }
      }
    }

    if (targetUserId) {
      const userBookings = await prisma.booking.findMany({
        where: { userId: targetUserId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
        },
      });
      return NextResponse.json({ success: true, data: userBookings, source: 'postgres' });
    }

    // Return latest bookings if no specific user filter matched
    const allBookings = await prisma.booking.findMany({
      take: 30,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: allBookings, source: 'postgres' });
  } catch (error: any) {
    console.warn('[API/Bookings] Database query error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      warning: 'Could not query bookings from database',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingType,
      targetId,
      totalAmount,
      bookingDate,
      userId,
      firebaseUid,
      userName,
      userPhone,
      userEmail,
    } = body;

    let targetUserId: string | null = null;
    const lookupKey = firebaseUid || userId;

    if (lookupKey) {
      // 1. Check if lookupKey is already a valid Postgres User ID
      try {
        const userById = await prisma.user.findUnique({
          where: { id: lookupKey },
        });
        if (userById) {
          targetUserId = userById.id;
        }
      } catch (err) {
        // Ignore CUID format validation errors and continue to firebaseUid lookup
      }

      // 2. If not found by primary ID, check by firebaseUid
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
                name: userName || 'AgriShield Farmer',
                phone: userPhone || null,
                email: userEmail || null,
                role: 'FARMER',
                isDemo: false,
              },
            });
            targetUserId = createdUser.id;
          }
        } catch (fbErr) {
          console.warn('[API/Bookings] User lookup/creation by firebaseUid error:', fbErr);
        }
      }
    }

    // 3. Fallback to existing demo user or first user in DB
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
        console.warn('[API/Bookings] Demo user fallback error:', demoErr);
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Could not resolve or create user profile for booking' },
        { status: 400 }
      );
    }

    const parsedDate = bookingDate ? new Date(bookingDate) : new Date();
    const validBookingDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    const createdBooking = await prisma.booking.create({
      data: {
        userId: targetUserId,
        bookingType: (bookingType || 'MACHINERY').toUpperCase(),
        targetId: String(targetId || 'ITEM-' + Date.now()),
        status: body.status || 'PENDING',
        bookingDate: validBookingDate,
        totalAmount: Number(totalAmount ?? body.pricePerHour ?? 0),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: createdBooking,
        message: 'Booking successfully confirmed in Supabase database.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API/Bookings] Error creating booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to process booking in database',
      },
      { status: 500 }
    );
  }
}
