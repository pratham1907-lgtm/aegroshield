import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        let safePhone: string | undefined = undefined;
        if (userPhone && String(userPhone).trim().length >= 10) {
          const existingUserWithPhone = await prisma.user.findFirst({
            where: { phone: String(userPhone).trim(), NOT: { firebaseUid: uid } },
          });
          if (!existingUserWithPhone) {
            safePhone = String(userPhone).trim();
          }
        }

        const dbUser = await prisma.user.upsert({
          where: { firebaseUid: uid },
          update: {
            email: email || undefined,
            name: name || undefined,
            phone: safePhone || undefined,
          },
          create: {
            firebaseUid: uid,
            email: email,
            name: name || 'Labour Leader',
            phone: safePhone || null,
            role: 'FARMER',
            isDemo: false,
          },
        });
        targetLeaderId = dbUser.id;
      } catch (err) {
        console.warn('[API/Labour] User upsert warning:', err);
      }
    }

    if (!targetLeaderId && userPhone) {
      try {
        const cleanP = String(userPhone).replace(/\D/g, '').trim();
        if (cleanP.length >= 10) {
          const userByPhone = await prisma.user.findFirst({
            where: { phone: cleanP },
          });
          if (userByPhone) {
            targetLeaderId = userByPhone.id;
          }
        }
      } catch (phoneErr) {
        console.warn('[API/Labour] Phone user lookup warning:', phoneErr);
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
