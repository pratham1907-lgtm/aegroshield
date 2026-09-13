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
            select: { id: true, name: true, email: true, phone: true },
          },
          machinery: true,
          labourPost: true,
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
          select: { id: true, name: true, email: true, phone: true },
        },
        machinery: true,
        labourPost: true,
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
      machineryId,
      labourPostId,
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

    // Read the incoming Firebase UID and email
    const headerAuth = request.headers.get('authorization') || '';
    const bearerToken = headerAuth.startsWith('Bearer ') ? headerAuth.slice(7).trim() : null;
    const headerFirebaseUid = request.headers.get('x-firebase-uid');
    const headerEmail = request.headers.get('x-user-email');
    const headerNameRaw = request.headers.get('x-user-name');
    const headerName = headerNameRaw ? decodeURIComponent(headerNameRaw) : null;
    const headerPhone = request.headers.get('x-user-phone');

    const uid = headerFirebaseUid || bearerToken || body.firebaseUid || body.userId;
    const email = headerEmail || body.email || userEmail || null;
    const name = headerName || body.customerName || body.userName || body.name || null;
    const phone = headerPhone || body.customerPhone || body.userPhone || body.contactPhone || body.phone || null;

    if (!uid) {
      const err = new Error('Authentication required: Missing real Firebase user UID.');
      console.error("API Creation Error:", err);
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        email: email || undefined,
        name: name || undefined,
        ...(phone ? { phone: phone } : {}),
      },
      create: {
        firebaseUid: uid,
        email: email,
        name: name || 'Google User',
        phone: phone || null,
        role: 'FARMER',
      },
    });

    const parsedDate = startDate ? new Date(startDate) : (bookingDate ? new Date(bookingDate) : new Date());
    const validBookingDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    const rawType = String(bookingType || 'MACHINERY').toUpperCase();
    const isLabour = rawType === 'LABOUR';

    let machineryIdToLink: string | null = null;
    let labourPostIdToLink: string | null = null;

    if (isLabour) {
      const targetLabourId = labourPostId || targetId;
      if (targetLabourId) {
        let existingLabour = await prisma.labourPost.findUnique({
          where: { id: targetLabourId },
        });

        if (!existingLabour) {
          try {
            existingLabour = await prisma.labourPost.create({
              data: {
                leaderId: dbUser.id,
                leaderName: body.leaderName || body.teamLeaderName || 'Labour Squad Leader',
                groupSize: Number(body.groupSize || body.teamSize || 5),
                primarySkill: body.primarySkill || body.specialization || 'General Agricultural Operations',
                wagePerDay: Number(body.wagePerDay || body.dailyRatePerWorker || body.pricePerHour || 400),
                district: body.district || 'Meerut',
                phone: body.phone || body.contactPhone || phone || '',
                isDemo: false,
              },
            });
          } catch (autoErr) {
            console.warn('[API/Bookings] Auto-create LabourPost note:', autoErr);
          }
        }

        if (existingLabour) {
          labourPostIdToLink = existingLabour.id;
        }
      }
    } else {
      const targetMachId = machineryId || targetId;
      if (targetMachId) {
        let existingMach = await prisma.machinery.findUnique({
          where: { id: targetMachId },
        });

        if (!existingMach) {
          try {
            existingMach = await prisma.machinery.create({
              data: {
                ownerId: dbUser.id,
                title: body.title || body.model || 'Agricultural Machinery',
                machineType: body.machineType || body.equipmentType || 'Tractor',
                ratePerHour: Number(body.ratePerHour || body.pricePerHour || 500),
                district: body.district || 'Meerut',
                contactPhone: body.contactPhone || phone || '',
                available: true,
                isDemo: false,
              },
            });
          } catch (autoErr) {
            console.warn('[API/Bookings] Auto-create Machinery note:', autoErr);
          }
        }

        if (existingMach) {
          machineryIdToLink = existingMach.id;
        }
      }
    }

    try {
      const createdBooking = await prisma.booking.create({
        data: {
          userId: dbUser.id,
          bookingType: rawType,
          targetId: String(targetId || labourPostIdToLink || machineryIdToLink || 'ITEM-' + Date.now()),
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
