import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';

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

    if (!targetUserId && lookupKey) {
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
      // 1. Outgoing bookings made by this user as customer
      const userBookings = await prisma.booking.findMany({
        where: { userId: targetUserId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          machinery: true,
          labourPost: true,
        },
      });

      // 2. Incoming booking requests for equipment or labour owned by this provider
      const providerUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, phone: true },
      });
      const providerPhone = providerUser?.phone?.trim() || (phone ? phone.trim() : null);

      const receivedBookings = await prisma.booking.findMany({
        where: {
          OR: [
            { machinery: { ownerId: targetUserId } },
            { labourPost: { leaderId: targetUserId } },
            ...(providerPhone
              ? [
                  { machinery: { contactPhone: providerPhone } },
                  { labourPost: { phone: providerPhone } },
                ]
              : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          machinery: true,
          labourPost: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: userBookings,
        received: receivedBookings,
        source: 'postgres',
      });
    }

    // Return latest bookings if no specific user filter matched
    const allBookings = await prisma.booking.findMany({
      take: 30,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        machinery: true,
        labourPost: true,
      },
    });

    return NextResponse.json({ success: true, data: allBookings, received: [], source: 'postgres' });
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
    const user = await requireUser(request);

    const body = await request.json();
    console.log("--> INCOMING REAL BOOKING REQUEST:", body);

    const {
      bookingType,
      targetId,
      machineryId,
      labourPostId,
      totalAmount,
      startDate,
      endDate,
      bookingDate,
      customerName,
      customerPhone,
      userName,
      userPhone,
      contactPhone,
    } = body;

    const phone = customerPhone || userPhone || contactPhone || user.phone || null;
    const name = customerName || userName || user.name || 'AgriShield Farmer';

    const parsedDate = startDate ? new Date(startDate) : (bookingDate ? new Date(bookingDate) : new Date());
    const validBookingDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const parsedEndDate = endDate ? new Date(endDate) : null;
    const validEndDate = parsedEndDate && !isNaN(parsedEndDate.getTime()) ? parsedEndDate : null;

    const rawType = String(bookingType || 'MACHINERY').toUpperCase();
    const isLabour = rawType === 'LABOUR';

    let machineryIdToLink: string | null = null;
    let labourPostIdToLink: string | null = null;

    if (isLabour) {
      const targetLabourId = labourPostId || targetId;
      if (targetLabourId) {
        const existingLabour = await prisma.labourPost.findUnique({
          where: { id: targetLabourId },
        });

        if (existingLabour) {
          labourPostIdToLink = existingLabour.id;
        }
      }
    } else {
      const targetMachId = machineryId || targetId;
      if (targetMachId) {
        const existingMach = await prisma.machinery.findUnique({
          where: { id: targetMachId },
        });

        if (existingMach) {
          machineryIdToLink = existingMach.id;
        }
      }
    }

    const itemTitle = isLabour
      ? String(body.leaderName || body.teamLeaderName || 'Agricultural Labour Squad')
      : String(body.title || body.model || body.machineType || 'Agricultural Machinery');

    const duration = isLabour
      ? `${body.days || 1} day${Number(body.days || 1) > 1 ? 's' : ''}`
      : `${body.hours || 4} hour${Number(body.hours || 4) > 1 ? 's' : ''}`;

    const createdBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        bookingType: rawType,
        targetId: String(targetId || labourPostIdToLink || machineryIdToLink || (isLabour ? 'LAB-' : 'MACH-') + Date.now()),
        customerName: name,
        customerPhone: phone || '',
        itemTitle: itemTitle,
        district: String(body.district || 'Meerut'),
        startDate: validBookingDate,
        endDate: validEndDate,
        duration: duration,
        machineryId: machineryIdToLink,
        labourPostId: labourPostIdToLink,
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
        machinery: true,
        labourPost: true,
      },
    });

    console.log("REAL_BOOKING_CREATED:", createdBooking.id, "Type:", rawType);

    return NextResponse.json(
      {
        success: true,
        data: createdBooking,
        message: 'Booking successfully confirmed in Supabase database.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Creation Error:", error);
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: status || 'CONFIRMED',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        machinery: true,
        labourPost: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Booking status updated to ${updated.status}`,
    });
  } catch (err: any) {
    console.error('[API/Bookings] PATCH error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update booking status' },
      { status: 500 }
    );
  }
}
