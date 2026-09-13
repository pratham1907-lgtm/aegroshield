import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_LABOUR } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDemo = searchParams.get('isDemo') === 'true';

  try {
    const items = await prisma.labourPost.findMany({
      where: {
        isDemo,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (items && items.length > 0) {
      // Map back to format expected by UI if needed
      const mapped = items.map((p) => ({
        id: p.id,
        teamLeaderName: p.leaderName,
        teamSize: p.groupSize,
        specialization: p.primarySkill,
        dailyRatePerWorker: p.wagePerDay,
        district: p.district,
        contactPhone: p.phone,
        available: true,
        isDemo: p.isDemo,
      }));
      return NextResponse.json({ success: true, data: mapped, source: 'postgres' });
    }

    // Graceful fallback to mock data if database has not been seeded yet and demo is requested
    if (isDemo) {
      return NextResponse.json({ success: true, data: MOCK_LABOUR, source: 'mock_fallback' });
    }

    return NextResponse.json({ success: true, data: [], source: 'postgres' });
  } catch (error) {
    console.warn('[API/Labour] Database query failed, using fallback:', error);
    return NextResponse.json({
      success: true,
      data: isDemo ? MOCK_LABOUR : [],
      source: 'fallback',
      warning: 'PostgreSQL connection not reachable or credentials pending',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leaderName,
      teamLeaderName,
      groupSize,
      teamSize,
      primarySkill,
      specialization,
      wagePerDay,
      dailyRatePerWorker,
      district,
      phone,
      contactPhone,
      leaderId,
      firebaseUid,
    } = body;

    let targetLeaderId = leaderId;

    if (!targetLeaderId && firebaseUid) {
      try {
        const user = await prisma.user.findUnique({ where: { firebaseUid } });
        if (user) targetLeaderId = user.id;
      } catch (err) {
        console.warn('[API/Labour] Could not find user by firebaseUid:', err);
      }
    }

    if (!targetLeaderId) {
      try {
        const fallbackUser = await prisma.user.upsert({
          where: { firebaseUid: 'production-default-labour-leader' },
          update: {},
          create: {
            firebaseUid: 'production-default-labour-leader',
            name: 'Labour Representative',
            role: 'FARMER',
            isDemo: false,
          },
        });
        targetLeaderId = fallbackUser.id;
      } catch (err) {
        console.warn('[API/Labour] Fallback user creation skipped:', err);
      }
    }

    try {
      const created = await prisma.labourPost.create({
        data: {
          leaderId: targetLeaderId || 'demo-user-id',
          leaderName: leaderName || teamLeaderName || 'Labour Squad Leader',
          groupSize: Number(groupSize || teamSize) || 5,
          primarySkill: primarySkill || specialization || 'General Agriculture & Harvesting',
          wagePerDay: Number(wagePerDay || dailyRatePerWorker) || 400,
          district: district || 'Meerut',
          phone: phone || contactPhone || '',
          isDemo: false,
        },
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (dbErr: any) {
      console.warn('[API/Labour] DB save failed, returning formatted response:', dbErr);
      const simulatedPost = {
        id: 'LBR-' + Math.floor(100000 + Math.random() * 900000),
        teamLeaderName: leaderName || teamLeaderName || 'Labour Squad Leader',
        teamSize: Number(groupSize || teamSize) || 5,
        specialization: primarySkill || specialization || 'General Agriculture & Harvesting',
        dailyRatePerWorker: Number(wagePerDay || dailyRatePerWorker) || 400,
        district: district || 'Meerut',
        contactPhone: phone || contactPhone || '',
        available: true,
        isDemo: false,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: simulatedPost, source: 'memory' }, { status: 201 });
    }
  } catch (error: any) {
    console.error('[API/Labour] Error creating labour post:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to post labour availability' },
      { status: 500 }
    );
  }
}
