import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_LABOUR } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const leaderId = searchParams.get('leaderId');
  const firebaseUid = searchParams.get('firebaseUid');

  try {
    const whereClause: any = {};

    const targetLeader = leaderId || userId;
    if (targetLeader) {
      whereClause.leaderId = targetLeader;
    } else if (firebaseUid && firebaseUid !== 'demo-farmer-seller-uid') {
      const user = await prisma.user.findUnique({ where: { firebaseUid } });
      if (user) whereClause.leaderId = user.id;
    }

    const items = await prisma.labourPost.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        leader: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (items && items.length > 0) {
      const mapped = items.map((p) => ({
        id: p.id,
        teamLeaderName: p.leaderName,
        leaderName: p.leaderName,
        teamSize: p.groupSize,
        groupSize: p.groupSize,
        specialization: p.primarySkill,
        primarySkill: p.primarySkill,
        dailyRatePerWorker: p.wagePerDay,
        wagePerDay: p.wagePerDay,
        district: p.district,
        contactPhone: p.phone,
        phone: p.phone,
        available: true,
        isDemo: p.isDemo,
        createdAt: p.createdAt,
      }));

      // If filtering by provider, return their posts directly
      if (targetLeader || (firebaseUid && firebaseUid !== 'demo-farmer-seller-uid')) {
        return NextResponse.json({ success: true, data: mapped, source: 'postgres' });
      }

      // For general catalog, ensure live database rows take top priority and merge with starter catalog
      const dbIds = new Set(mapped.map((m) => m.id));
      const combined = [...mapped, ...MOCK_LABOUR.filter((m) => !dbIds.has(m.id))];
      return NextResponse.json({ success: true, data: combined, source: 'postgres' });
    }

    // Default to mock catalog if database has no records yet
    return NextResponse.json({ success: true, data: MOCK_LABOUR, source: 'mock_fallback' });
  } catch (error: any) {
    console.warn('[API/Labour] Database query failed, using fallback:', error);
    return NextResponse.json({
      success: true,
      data: MOCK_LABOUR,
      source: 'fallback',
      warning: error?.message || 'Could not query labour posts from database',
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
      userId,
      leaderId,
      firebaseUid,
    } = body;

    const headerAuth = request.headers.get('authorization') || '';
    const bearerToken = headerAuth.startsWith('Bearer ') ? headerAuth.slice(7).trim() : null;
    const headerFirebaseUid = request.headers.get('x-firebase-uid');
    const headerEmail = request.headers.get('x-user-email');
    const headerNameRaw = request.headers.get('x-user-name');
    const headerName = headerNameRaw ? decodeURIComponent(headerNameRaw) : null;
    const headerPhone = request.headers.get('x-user-phone');

    const uid = headerFirebaseUid || bearerToken || firebaseUid || userId || leaderId;
    const email = headerEmail || body.email || null;
    const name = headerName || body.userName || body.name || null;
    const userPhone = headerPhone || phone || contactPhone || null;

    let targetLeaderId = leaderId || userId;

    if (uid) {
      try {
        const dbUser = await prisma.user.upsert({
          where: { firebaseUid: uid },
          update: {
            email: email || undefined,
            name: name || undefined,
            phone: userPhone || undefined,
          },
          create: {
            firebaseUid: uid,
            email: email,
            name: name || 'Labour Leader',
            phone: userPhone || null,
            role: 'FARMER',
            isDemo: false,
          },
        });
        targetLeaderId = dbUser.id;
      } catch (err) {
        console.warn('[API/Labour] User upsert warning:', err);
      }
    }

    if (!targetLeaderId) {
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
    }

    const postLeaderName = leaderName || teamLeaderName || 'Labour Squad Leader';
    const size = Number(groupSize || teamSize) || 5;
    const skill = primarySkill || specialization || 'General Agriculture & Harvesting';
    const wage = Number(wagePerDay || dailyRatePerWorker) || 400;
    const dist = district || 'Meerut';
    const postPhone = phone || contactPhone || userPhone || '';

    const created = await prisma.labourPost.create({
      data: {
        leaderId: targetLeaderId,
        leaderName: postLeaderName,
        groupSize: size,
        primarySkill: skill,
        wagePerDay: wage,
        district: dist,
        phone: postPhone,
        isDemo: false,
      },
      include: {
        leader: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    console.log("REAL_LABOUR_POST_CREATED:", created.id);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[API/Labour] Error creating labour post:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to post labour availability in Supabase database.' },
      { status: 500 }
    );
  }
}
