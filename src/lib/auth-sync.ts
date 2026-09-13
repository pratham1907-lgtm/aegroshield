import { prisma } from './prisma';

export interface MinimalFirebaseUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  name?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  role?: string | null;
}

/**
 * Hybrid Auth Helper: Syncs Firebase Auth User details to PostgreSQL via Prisma.
 * Guarantees that every authenticated Firebase user has a corresponding relational User record in Postgres.
 *
 * @param firebaseUser - User object from Firebase Auth or AuthContext
 * @returns The synced Prisma User record
 */
export async function syncFirebaseUserToPrisma(firebaseUser: MinimalFirebaseUser) {
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error('syncFirebaseUserToPrisma requires a valid firebaseUser with a uid.');
  }

  const uid = firebaseUser.uid;
  const email = firebaseUser.email || null;
  const name = firebaseUser.displayName || firebaseUser.name || null;
  const phone = firebaseUser.phoneNumber || firebaseUser.phone || null;
  const role = firebaseUser.role || 'FARMER';

  try {
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          name,
          phone,
          role,
        },
      });
      return newUser;
    }

    // Update profile fields if changed
    const updatedUser = await prisma.user.update({
      where: { firebaseUid: uid },
      data: {
        email: email ?? existingUser.email,
        name: name ?? existingUser.name,
        phone: phone ?? existingUser.phone,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error syncing Firebase user to Prisma PostgreSQL:', error);
    throw error;
  }
}
