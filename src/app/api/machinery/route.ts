import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';

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
    const user = await requireUser(request);

    const body = await request.json();
    const {
      title,
      model,
      machineType,
      equipmentType,
      ratePerHour,
      district,
      contactPhone,
      phone,
    } = body;

    const machineTitle = (title || model || equipmentType || '').trim();
    if (!machineTitle) {
      throw new HttpError('Machine title or model is required', 400);
    }

    const rate = Number(ratePerHour);
    if (isNaN(rate) || rate <= 0) {
      throw new HttpError('A valid hourly rate is required', 400);
    }

    const type = machineType || equipmentType || 'Tractor';
    const dist = district || 'Meerut';
    const contact = contactPhone || phone || user.phone || '';

    const created = await prisma.machinery.create({
      data: {
        ownerId: user.id,
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
    return handleAuthError(error);
  }
}

