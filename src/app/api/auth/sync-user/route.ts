/**
 * POST /api/auth/sync-user
 *
 * Accepts a Firebase Auth user synchronization request.
 *
 * Security:
 * - Enforces valid Firebase ID token verification using requireUser(request).
 * - Rejects unauthenticated requests with HTTP 401 Unauthorized.
 * - Prevents role spoofing: Any role sent in the request body is discarded.
 *   Newly synced users default to role 'FARMER' unless explicitly managed
 *   through secure admin or seller registration workflows. Existing roles
 *   (ADMIN, SELLER) are safely preserved.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUser, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce valid Firebase ID token verification (rejects missing/invalid tokens with 401)
    const authenticatedUser = await requireUser(request);

    // 2. Parse body for profile fields (displayName, email, phoneNumber)
    const body = await request.json().catch(() => ({}));
    const { email, displayName, phoneNumber } = body;

    const cleanName = typeof displayName === 'string' ? displayName.trim() : null;
    const cleanEmail = typeof email === 'string' ? email.trim() : null;
    const cleanPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : null;

    // 3. Security: Prevent role spoofing from request body.
    // We do NOT accept 'role' from the client body.
    // The role is strictly managed server-side and preserved from the database record.
    const updatedUser = await prisma.user.update({
      where: { id: authenticatedUser.id },
      data: {
        email: cleanEmail || authenticatedUser.email || undefined,
        name: cleanName || authenticatedUser.name || undefined,
        phone: cleanPhone || authenticatedUser.phone || undefined,
        // Role is intentionally excluded to prevent privilege escalation / role spoofing.
      },
    });

    return NextResponse.json({
      success: true,
      action: 'sync',
      user: {
        id: updatedUser.id,
        firebaseUid: updatedUser.firebaseUid,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role, // Authoritative role from database
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error: any) {
    return handleAuthError(error);
  }
}
