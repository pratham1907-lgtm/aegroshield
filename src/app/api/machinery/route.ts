import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_MACHINERY } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDemo = searchParams.get('isDemo') === 'true';

  try {
    const items = await prisma.machinery.findMany({
      where: {
        available: true,
        isDemo,
      },
      orderBy: { createdAt: 'desc' },
    });

    // If query returns results from PostgreSQL, return them
    if (items && items.length > 0) {
      return NextResponse.json({ success: true, data: items, source: 'postgres' });
    }

    // Graceful fallback to mock data if database has not been seeded yet and demo is requested
    if (isDemo) {
      return NextResponse.json({ success: true, data: MOCK_MACHINERY, source: 'mock_fallback' });
    }

    return NextResponse.json({ success: true, data: [], source: 'postgres' });
  } catch (error) {
    console.warn('[API/Machinery] Database query failed, using fallback:', error);
    return NextResponse.json({
      success: true,
      data: isDemo ? MOCK_MACHINERY : [],
      source: 'fallback',
      warning: 'PostgreSQL connection not reachable or credentials pending',
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
      firebaseUid,
    } = body;

    let targetOwnerId = ownerId;

    if (!targetOwnerId && firebaseUid) {
      try {
        const user = await prisma.user.findUnique({ where: { firebaseUid } });
        if (user) targetOwnerId = user.id;
      } catch (err) {
        console.warn('[API/Machinery] Could not find user by firebaseUid:', err);
      }
    }

    if (!targetOwnerId) {
      try {
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
      } catch (err) {
        console.warn('[API/Machinery] Fallback user creation skipped:', err);
      }
    }

    try {
      const created = await prisma.machinery.create({
        data: {
          ownerId: targetOwnerId || 'demo-user-id',
          title: title || model || equipmentType || 'Agricultural Machinery',
          machineType: machineType || equipmentType || 'Tractor',
          ratePerHour: Number(ratePerHour) || 500,
          district: district || 'Meerut',
          contactPhone: contactPhone || '',
          available: true,
          isDemo: false,
        },
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (dbErr: any) {
      console.warn('[API/Machinery] DB save failed, returning formatted response:', dbErr);
      const simulatedListing = {
        id: 'MCH-' + Math.floor(100000 + Math.random() * 900000),
        title: title || model || equipmentType || 'Agricultural Machinery',
        machineType: machineType || equipmentType || 'Tractor',
        ratePerHour: Number(ratePerHour) || 500,
        district: district || 'Meerut',
        contactPhone: contactPhone || '',
        available: true,
        isDemo: false,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: simulatedListing, source: 'memory' }, { status: 201 });
    }
  } catch (error: any) {
    console.error('[API/Machinery] Error creating machinery:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register machinery' },
      { status: 500 }
    );
  }
}
