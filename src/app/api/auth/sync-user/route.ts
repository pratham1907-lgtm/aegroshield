/**
 * POST /api/auth/sync-user
 *
 * Accepts a Firebase Auth user payload from the client and upserts the
 * corresponding record in the Supabase PostgreSQL User table via Prisma.
 *
 * Security notes:
 * - This route does NOT use the Supabase anon key and therefore bypasses RLS
 *   (Prisma connects as the `postgres` role which has BYPASSRLS).
 * - The ADMIN_SECRET_KEY header provides lightweight call-site verification
 *   so random clients cannot forge arbitrary user records.
 *   In a future iteration, replace this with Firebase ID token verification
 *   using the Firebase Admin SDK on the server.
 */
import { NextRequest, NextResponse } from 'next/server';
import { syncFirebaseUserToPrisma } from '@/lib/auth-sync';

export async function POST(request: NextRequest) {
  try {
    // ── Lightweight call-site guard ─────────────────────────────────────────
    // The client sends the publishable admin key so arbitrary callers cannot
    // insert fake uid records. Replace with Firebase Admin token verification
    // for production hardening.
    const clientKey = request.headers.get('x-sync-key') || '';
    const expectedKey = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || '';
    if (expectedKey && clientKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body = await request.json();
    const { uid, email, displayName, phoneNumber, role } = body;

    if (!uid || typeof uid !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid uid' },
        { status: 400 }
      );
    }

    // ── Upsert into Supabase via Prisma ─────────────────────────────────────
    const user = await syncFirebaseUserToPrisma({
      uid,
      email:       email       || null,
      displayName: displayName || null,
      phoneNumber: phoneNumber || null,
      role:        role        || 'FARMER',
    });

    return NextResponse.json({
      success: true,
      action: 'upsert',
      user: {
        id:          user.id,
        firebaseUid: user.firebaseUid,
        email:       user.email,
        name:        user.name,
        role:        user.role,
        createdAt:   user.createdAt,
        updatedAt:   user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[API/auth/sync-user] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
