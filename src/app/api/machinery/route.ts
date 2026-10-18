import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';
import { createMachinerySchema, formatZodError } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get('ownerId');
  const phone = searchParams.get('phone');
  const firebaseUid = searchParams.get('firebaseUid');
  const state = searchParams.get('state');
  const district = searchParams.get('district');
  const machineType = searchParams.get('machineType') || searchParams.get('type');
  const search = searchParams.get('search');

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

    if (state && state !== 'All') {
      whereClause.state = { equals: state, mode: 'insensitive' };
    }

    if (district && district !== 'All') {
      whereClause.district = { equals: district, mode: 'insensitive' };
    }

    if (machineType && machineType !== 'All') {
      whereClause.machineType = { equals: machineType, mode: 'insensitive' };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { machineType: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
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
    return NextResponse.json({ success: true, data: items || [] });
  } catch (error: any) {
    console.error('[API/Machinery] Database query failed:', error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve machinery listings. Service temporarily unavailable.',
      },
      { status: 503 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

    let body;
    try {
      body = await request.json();
    } catch {
      throw new HttpError('Invalid JSON request body', 400);
    }

    const validation = createMachinerySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: formatZodError(validation.error),
          details: validation.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      title,
      model,
      machineType,
      equipmentType,
      ratePerHour,
      district,
      state: machineState,
      contactPhone,
      phone,
      available,
    } = validation.data;

    const machineTitle = (title || model || machineType || equipmentType || '').trim();
    const type = (machineType || equipmentType || 'Tractor').trim();
    const contact = contactPhone || phone || user.phone || '';

    const created = await prisma.machinery.create({
      data: {
        ownerId: user.id,
        title: machineTitle,
        machineType: type,
        ratePerHour,
        district,
        state: (machineState || 'Uttar Pradesh').trim(),
        contactPhone: contact,
        available: available ?? true,
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

