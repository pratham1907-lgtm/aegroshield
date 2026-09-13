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

    // Extract real authenticated user from headers or request payload
    const headerAuth = request.headers.get('authorization') || '';
    const bearerToken = headerAuth.startsWith('Bearer ') ? headerAuth.slice(7).trim() : null;
    const headerFirebaseUid = request.headers.get('x-firebase-uid') || bearerToken;
    const headerEmail = request.headers.get('x-user-email');
    const headerNameRaw = request.headers.get('x-user-name');
    const headerName = headerNameRaw ? decodeURIComponent(headerNameRaw) : null;
    const headerPhone = request.headers.get('x-user-phone');

    const realFirebaseUid = headerFirebaseUid || firebaseUid || (userId && !String(userId).startsWith('demo') ? userId : null);
    const realEmail = headerEmail || body.email || userEmail || null;
    const realName = (customerName || headerName || userName || body.name || 'AgriShield Farmer').trim();
    const realPhone = (customerPhone || headerPhone || userPhone || contactPhone || body.phone || '').trim();

    let user = null;

    // 1. Dynamic User Upsert using real Firebase UID
    if (realFirebaseUid) {
      try {
        user = await prisma.user.upsert({
          where: { firebaseUid: realFirebaseUid },
          update: {
            ...(realEmail ? { email: realEmail } : {}),
            ...(realName ? { name: realName } : {}),
            ...(realPhone ? { phone: realPhone } : {}),
          },
          create: {
            firebaseUid: realFirebaseUid,
            email: realEmail,
            name: realName,
            phone: realPhone || null,
            role: 'FARMER',
          },
        });
      } catch (upsertErr) {
        console.error("API Creation Error:", upsertErr);
      }
    }

    // 2. If no firebaseUid or upsert failed, resolve/create by real phone
    if (!user && realPhone) {
      try {
        user = await prisma.user.findFirst({ where: { phone: realPhone } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: realName,
              phone: realPhone,
              email: realEmail,
              role: 'FARMER',
            },
          });
        }
      } catch (phoneErr) {
        console.error("API Creation Error:", phoneErr);
      }
    }

    if (!user) {
      const err = new Error('Could not resolve or authenticate user account for booking.');
      console.error("API Creation Error:", err);
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 400 }
      );
    }

    const parsedDate = startDate ? new Date(startDate) : (bookingDate ? new Date(bookingDate) : new Date());
    const validBookingDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    try {
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
    } catch (createErr) {
      console.error("API Creation Error:", createErr);
      return NextResponse.json(
        {
          success: false,
          error: (createErr as any)?.message || 'Database error: Failed to insert booking into Supabase',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("API Creation Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to process booking in database',
      },
      { status: 500 }
    );
  }
}
