/**
 * auth-sync.ts
 * Server-side utility: Syncs a Firebase Auth user into the Supabase
 * PostgreSQL User table via Prisma using a single atomic upsert.
 *
 * NOTE: This module imports Prisma and must only be imported from:
 *   - Next.js API routes (server-side)
 *   - Server Actions
 * Never import this in 'use client' components.
 */
import { prisma } from './prisma';

export interface FirebaseUserPayload {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  /** Optional role override (defaults to 'FARMER') */
  role?: string | null;
}

/**
 * Upserts a Firebase Auth user into the Supabase User table via Prisma.
 * - If no record exists for this firebaseUid → creates a new row.
 * - If a record already exists → updates email / name only if they have
 *   changed (phone is preserved server-side to avoid overwriting with null).
 *
 * @param payload - Firebase user fields from the client
 * @returns The created or updated Prisma User record
 */
export async function syncFirebaseUserToPrisma(payload: FirebaseUserPayload) {
  const { uid, email, displayName, phoneNumber, role } = payload;

  if (!uid) {
    throw new Error('[auth-sync] syncFirebaseUserToPrisma: uid is required.');
  }

  const name  = displayName?.trim() || null;
  const phone = phoneNumber || null;
  const resolvedRole = role || 'FARMER';

  const user = await prisma.user.upsert({
    where: { firebaseUid: uid },
    create: {
      firebaseUid: uid,
      email:  email || null,
      name,
      phone,
      role:   resolvedRole,
      isDemo: false,
    },
    update: {
      // Only update fields that Firebase definitively provides.
      // Phone is intentionally excluded from the update clause so that
      // a user who set their phone through the app UI doesn't have it
      // wiped on next login (Firebase doesn't always return phoneNumber).
      email:  email || undefined,
      name:   name  || undefined,
    },
  });

  return user;
}
