import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';
import { createLabourPostSchema, formatZodError } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const leaderId = searchParams.get('leaderId');
  const phone = searchParams.get('phone');
  const firebaseUid = searchParams.get('firebaseUid');
  const state = searchParams.get('state');
  const district = searchParams.get('district');
  const taskType = searchParams.get('taskType') || searchParams.get('skill');
  const search = searchParams.get('search');

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

    if (state && state !== 'All') {
      whereClause.state = { equals: state, mode: 'insensitive' };
    }

    if (district && district !== 'All') {
      whereClause.district = { equals: district, mode: 'insensitive' };
    }

    if (taskType && taskType !== 'All') {
      whereClause.primarySkill = { contains: taskType, mode: 'insensitive' };
    }

    if (search) {
      whereClause.OR = [
        { leaderName: { contains: search, mode: 'insensitive' } },
        { primarySkill: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
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
      state: p.state || 'Uttar Pradesh',
      district: p.district,
      contactPhone: p.phone,
      phone: p.phone,
      available: true,
      isDemo: p.isDemo,
      createdAt: p.createdAt,
    }));

    // Pure real database rows - never merge or fallback to mock data
    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error('[API/Labour] Database query failed:', error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve labour listings. Service temporarily unavailable.',
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

    const validation = createLabourPostSchema.safeParse(body);
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
      leaderName,
      teamLeaderName,
      groupSize,
      teamSize,
      taskType,
      primarySkill,
      specialization,
      wagePerDay,
      dailyRatePerWorker,
      district,
      phone,
      contactPhone,
    } = validation.data;

    const postLeaderName = (leaderName || teamLeaderName || user.name || 'Labour Leader').trim();
    const size = groupSize ?? teamSize ?? 1;
    const wage = wagePerDay ?? dailyRatePerWorker ?? 400;
    const skill = (taskType || primarySkill || specialization || 'General Agriculture & Harvesting').trim();
    const postPhone = phone || contactPhone || user.phone || '';

    const created = await prisma.labourPost.create({
      data: {
        leaderId: user.id,
        leaderName: postLeaderName,
        groupSize: size,
        primarySkill: skill,
        wagePerDay: wage,
        district,
        state: (validation.data.state || 'Uttar Pradesh').trim(),
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

