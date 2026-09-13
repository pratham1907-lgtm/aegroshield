import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const firebaseUid = searchParams.get('firebaseUid');
  const userId = searchParams.get('userId');
  const phone = searchParams.get('phone') || searchParams.get('customerPhone');

  try {
    let targetUserId: string | null = null;
    const lookupKey = firebaseUid || userId;

    if (phone) {
      try {
        const userByPhone = await prisma.user.findFirst({ where: { phone: phone.trim() } });
        if (userByPhone) targetUserId = userByPhone.id;
      } catch (phoneErr) {
        console.warn('[API/Bookings] Phone lookup warning in GET:', phoneErr);
      }
    }

    if (!targetUserId && lookupKey && lookupKey !== 'demo-farmer-seller-uid') {
      try {
        const userById = await prisma.user.findUnique({
          where: { id: lookupKey },
        });
        if (userById) {
          targetUserId = userById.id;
        } else {
          const userByFb = await prisma.user.findUnique({
            where: { firebaseUid: lookupKey },
          });
          if (userByFb) {
            targetUserId = userByFb.id;
          }
        }
      } catch (err) {
        // Fall through
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
      if (userBookings.length > 0) {
        return NextResponse.json({ success: true, data: userBookings, source: 'postgres' });
      }
    }

    // Return latest bookings if no specific user filter matched or if user has no specific bookings
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
    console.log("--> INCOMING REAL BOOKING REQUEST:", body);

    const {
      bookingType,
      targetId,
      totalAmount,
      startDate,
      endDate,
      bookingDate,
      userId,
      firebaseUid,
      customerName,
      customerPhone,
      userName,
      userPhone,
      contactPhone,
      userEmail,
    } = body;

    // Resolve or auto-create User record for this booking
    const cleanPhone = customerPhone || userPhone || contactPhone ? String(customerPhone || userPhone || contactPhone).trim() : null;
    const cleanName = customerName || userName ? String(customerName || userName).trim() : 'AgriShield Farmer';
    const lookupKey = firebaseUid || userId;

    let user = null;

    // 1. Look up user by phone if available
    if (cleanPhone) {
      try {
        user = await prisma.user.findFirst({ where: { phone: cleanPhone } });
      } catch (err) {
        console.warn('[API/Bookings] Phone lookup warning:', err);
      }
    }

    // 2. Look up user by lookupKey (id or firebaseUid) if not found by phone
    if (!user && lookupKey && typeof lookupKey === 'string' && lookupKey.trim() !== '') {
      try {
        user = (await prisma.user.findUnique({ where: { id: lookupKey } })) ||
               (await prisma.user.findUnique({ where: { firebaseUid: lookupKey } }));
      } catch (err) {
        console.warn('[API/Bookings] User ID lookup warning:', err);
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
            ...(lookupKey && lookupKey !== 'demo-farmer-seller-uid' ? { firebaseUid: lookupKey } : {}),
          },
        });
      } catch (createErr) {
        console.warn('[API/Bookings] Auto user creation warning:', createErr);
      }
    }

    // 4. Fallback to existing demo user or any user in DB
    if (!user) {
      try {
        user =
          (await prisma.user.findFirst({ where: { isDemo: true } })) ||
          (await prisma.user.findFirst());
      } catch (demoErr) {
        console.warn('[API/Bookings] Demo user fallback error:', demoErr);
      }
    }

    // 5. Ultimate fallback if DB has 0 users
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: cleanName,
          phone: cleanPhone,
          role: 'FARMER',
          isDemo: true,
        },
      });
    }

    const parsedDate = startDate ? new Date(startDate) : (bookingDate ? new Date(bookingDate) : new Date());
    const validBookingDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    const createdBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        bookingType: String(bookingType || 'MACHINERY').toUpperCase(),
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

    console.log("REAL_BOOKING_CREATED:", createdBooking.id);

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
