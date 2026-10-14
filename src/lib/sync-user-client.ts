/**
 * sync-user-client.ts
 * Browser-safe helper that calls POST /api/auth/sync-user.
 *
 * Use this from 'use client' components and contexts — it contains NO
 * Prisma or Node.js-only imports.
 */

export interface SyncUserPayload {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
}

/**
 * Sends the Firebase user data to the Next.js API route which upserts
 * the user into the Supabase PostgreSQL User table.
 *
 * Silently swallows network errors so that auth failures never block the UI.
 */
export async function syncUserToDatabase(payload: SyncUserPayload): Promise<void> {
  try {
    const res = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sync-key': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || '',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('[syncUserToDatabase] Sync response not OK:', res.status, text);
    }
  } catch (err) {
    // Non-fatal: sync failures should not prevent the user from using the app.
    console.warn('[syncUserToDatabase] Network error during user sync:', err);
  }
}
