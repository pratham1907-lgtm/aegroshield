import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';
import { sendBookingConfirmedAlert } from '@/lib/notifications';

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
    console.error('[API/Bookings] Database query error:', error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve bookings. Service temporarily unavailable.',
      },
      { status: 503 }
    );
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

    // Dispatch non-blocking SMS/WhatsApp booking alerts to farmer and service provider
    sendBookingConfirmedAlert({
      bookingId: createdBooking.id,
      serviceType: createdBooking.bookingType === 'LABOUR' ? 'LABOUR' : 'MACHINERY',
      itemName: createdBooking.itemTitle || (createdBooking.bookingType === 'MACHINERY' ? 'Farm Equipment' : 'Farm Labour'),
      farmerName: createdBooking.customerName || name,
      farmerPhone: createdBooking.customerPhone || phone || '',
      ownerPhone: createdBooking.machinery?.contactPhone || undefined,
      duration: createdBooking.duration || undefined,
      totalAmount: createdBooking.totalAmount,
    }).catch(err => console.error('[Booking Alert Error]:', err));

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
    // 1. Require authentication using verified Firebase ID token
    const user = await requireUser(request);

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || typeof bookingId !== 'string') {
      throw new HttpError('bookingId is required and must be a string', 400);
    }

    // 2. Fetch existing booking with machinery and labourPost relations
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        machinery: true,
        labourPost: true,
      },
    });

    if (!existingBooking) {
      throw new HttpError('Booking not found', 404);
    }

    // 3. Authorization check:
    // Only the booking customer, the assigned machinery vendor / labour leader, or an ADMIN can update status.
    const userCleanPhone = user.phone ? user.phone.replace(/\D/g, '').slice(-10) : '';
    const isAdmin = user.role === 'ADMIN';
    const isBookingOwner = existingBooking.userId === user.id;

    const isMachineryOwner =
      existingBooking.machinery?.ownerId === user.id ||
      (!!userCleanPhone &&
        !!existingBooking.machinery?.contactPhone &&
        existingBooking.machinery.contactPhone.replace(/\D/g, '').endsWith(userCleanPhone));

    const isLabourLeader =
      existingBooking.labourPost?.leaderId === user.id ||
      (!!userCleanPhone &&
        !!(existingBooking.labourPost as any)?.phone &&
        String((existingBooking.labourPost as any).phone).replace(/\D/g, '').endsWith(userCleanPhone));

    if (!isAdmin && !isBookingOwner && !isMachineryOwner && !isLabourLeader) {
      throw new HttpError(
        'Forbidden: You are not authorized to update this booking. Only the customer, assigned provider, or admin can update status.',
        403
      );
    }

    // 4. Validate status value
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'];
    const newStatus = status ? String(status).toUpperCase() : 'CONFIRMED';
    if (!validStatuses.includes(newStatus)) {
      throw new HttpError(`Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`, 400);
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
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
    console.error('[API/Bookings] PATCH error:', err?.message || err);
    return handleAuthError(err);
  }
}

