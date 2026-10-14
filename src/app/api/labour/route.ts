import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const leaderId = searchParams.get('leaderId');
  const phone = searchParams.get('phone');
  const firebaseUid = searchParams.get('firebaseUid');

  const targetLeader = leaderId || userId;

  try {
    const whereClause: any = {};

    if (targetLeader) {
      whereClause.leaderId = targetLeader;
    } else if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').trim();
      const user = await prisma.user.findFirst({ where: { phone: cleanPhone } });
      if (user) whereClause.leaderId = user.id;
    } else if (firebaseUid) {
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

    const mapped = (items || []).map((p) => ({
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

    // Pure real database rows - never merge or fallback to mock data
    return NextResponse.json({ success: true, data: mapped, source: 'postgres' });
  } catch (error: any) {
    console.warn('[API/Labour] Database query failed:', error);
    return NextResponse.json({
      success: false,
      data: [],
      source: 'postgres_error',
      warning: error?.message || 'Could not query labour posts from database',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

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
    } = body;

    const postLeaderName = (leaderName || teamLeaderName || user.name || 'Labour Leader').trim();
    const size = Math.max(1, Number(groupSize || teamSize) || 1);
    const wage = Number(wagePerDay || dailyRatePerWorker);
    if (isNaN(wage) || wage <= 0) {
      throw new HttpError('A valid daily wage rate is required', 400);
    }

    const skill = (primarySkill || specialization || 'General Agriculture & Harvesting').trim();
    const dist = district || 'Meerut';
    const postPhone = phone || contactPhone || user.phone || '';

    const created = await prisma.labourPost.create({
      data: {
        leaderId: user.id,
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
    return handleAuthError(error);
  }
}

