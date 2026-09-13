import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get('ownerId');
  const phone = searchParams.get('phone');
  const firebaseUid = searchParams.get('firebaseUid');

  try {
    const whereClause: any = { available: true };

    if (ownerId) {
      whereClause.ownerId = ownerId;
    } else if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').trim();
      const user = await prisma.user.findFirst({ where: { phone: cleanPhone } });
      if (user) whereClause.ownerId = user.id;
    } else if (firebaseUid) {
      const user = await prisma.user.findUnique({ where: { firebaseUid } });
      if (user) whereClause.ownerId = user.id;
    }

    const items = await prisma.machinery.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Pure real database rows - never merge or fallback to mock data
    return NextResponse.json({ success: true, data: items || [], source: 'postgres' });
  } catch (error: any) {
    console.warn('[API/Machinery] Database query failed:', error);
    return NextResponse.json({
      success: false,
      data: [],
      source: 'postgres_error',
      warning: error?.message || 'Could not query machinery from database',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      model,
      machineType,
      equipmentType,
      ratePerHour,
      district,
      contactPhone,
      ownerId,
      userId,
      firebaseUid,
    } = body;

    const headerAuth = request.headers.get('authorization') || '';
    const bearerToken = headerAuth.startsWith('Bearer ') ? headerAuth.slice(7).trim() : null;
    const headerFirebaseUid = request.headers.get('x-firebase-uid');
    const headerEmail = request.headers.get('x-user-email');
    const headerNameRaw = request.headers.get('x-user-name');
    const headerName = headerNameRaw ? decodeURIComponent(headerNameRaw) : null;
    const headerPhone = request.headers.get('x-user-phone');

    const uid = headerFirebaseUid || bearerToken || firebaseUid || userId || ownerId;
    const email = headerEmail || body.email || null;
    const name = headerName || body.userName || body.name || null;
    const phone = headerPhone || contactPhone || body.phone || null;

    let targetOwnerId = ownerId || userId;

    if (uid) {
      try {
        const dbUser = await prisma.user.upsert({
          where: { firebaseUid: uid },
          update: {
            email: email || undefined,
            name: name || undefined,
            phone: phone || undefined,
          },
          create: {
            firebaseUid: uid,
            email: email,
            name: name || 'Equipment Partner',
            phone: phone || null,
            role: 'FARMER',
            isDemo: false,
          },
        });
        targetOwnerId = dbUser.id;
      } catch (err) {
        console.warn('[API/Machinery] User upsert warning:', err);
      }
    }

    if (!targetOwnerId && phone) {
      try {
        const cleanP = String(phone).replace(/\D/g, '').trim();
        if (cleanP.length >= 10) {
          const userByPhone = await prisma.user.findFirst({
            where: { phone: cleanP },
          });
          if (userByPhone) {
            targetOwnerId = userByPhone.id;
          }
        }
      } catch (phoneErr) {
        console.warn('[API/Machinery] Phone user lookup warning:', phoneErr);
      }
    }

    if (!targetOwnerId) {
      const fallbackUser = await prisma.user.upsert({
        where: { firebaseUid: 'production-default-owner' },
        update: {},
        create: {
          firebaseUid: 'production-default-owner',
          name: 'Platform Equipment Partner',
          role: 'FARMER',
          isDemo: false,
        },
      });
      targetOwnerId = fallbackUser.id;
    }

    const machineTitle = title || model || equipmentType || 'Agricultural Machinery';
    const type = machineType || equipmentType || 'Tractor';
    const rate = Number(ratePerHour) || 500;
    const dist = district || 'Meerut';
    const contact = contactPhone || phone || '';

    const created = await prisma.machinery.create({
      data: {
        ownerId: targetOwnerId,
        title: machineTitle,
        machineType: type,
        ratePerHour: rate,
        district: dist,
        contactPhone: contact,
        available: true,
        isDemo: false,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    console.log("REAL_MACHINERY_CREATED:", created.id);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[API/Machinery] Error creating machinery:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register machinery in Supabase database.' },
      { status: 500 }
    );
  }
}
