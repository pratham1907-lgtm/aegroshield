/**
 * POST /api/auth/sync-user
 *
 * Accepts a Firebase Auth user payload from the client and upserts the
 * corresponding record in the Supabase PostgreSQL User table via Prisma.
 *
 * Security notes:
 * - This route does NOT use the Supabase anon key and connects via Prisma.
 * - If an Authorization: Bearer <token> is provided, the token UID is cryptographically verified.

 */
import { NextRequest, NextResponse } from 'next/server';
import { syncFirebaseUserToPrisma } from '@/lib/auth-sync';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    let authenticatedUid: string | null = null;

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const decoded = await adminAuth.verifyIdToken(token);
          authenticatedUid = decoded.uid;
        } catch (tokenErr) {
          console.warn('[API/Auth/SyncUser] Warning verifying sync token:', tokenErr);
        }
      }
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

    const targetUid = authenticatedUid || uid;

    // ── Upsert into Supabase via Prisma ─────────────────────────────────────
    const user = await syncFirebaseUserToPrisma({
      uid:         targetUid,
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
