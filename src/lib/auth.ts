import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

/**
 * Lightweight HTTP Error class with status code support.
 */
export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * Validates the Firebase ID token from the Authorization header and retrieves
 * the corresponding User record from Prisma (including seller relations).
 *
 * @param req - Incoming Request or NextRequest
 * @returns The verified Prisma User object with sellers relation
 * @throws HttpError(401) if token is missing, invalid, or expired
 * @throws HttpError(403) if user is not found in the database
 */
export async function requireUser(req: Request) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError('Missing or invalid Authorization header. Expected "Bearer <token>"', 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new HttpError('Bearer token is empty', 401);
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (err: any) {
    throw new HttpError(
      `Authentication failed: ${err?.message || 'Invalid or expired Firebase ID token'}`,
      401
    );
  }

  if (!decodedToken?.uid) {
    throw new HttpError('Invalid token payload: missing UID', 401);
  }

  const user = await prisma.user.findUnique({
    where: { firebaseUid: decodedToken.uid },
    include: {
      sellers: true,
    },
  });

  if (!user) {
    throw new HttpError(
      'Access forbidden: User account not found in database. Please ensure account is registered and synced.',
      403
    );
  }

  return user;
}

/**
 * Validates the Firebase ID token from the Authorization header, verifies the
 * cryptographic custom claim { admin: true }, ensures the Prisma User record has role 'ADMIN',
 * and returns the verified admin User object.
 *
 * @param req - Incoming Request or NextRequest
 * @returns The verified Prisma Admin User object
 * @throws HttpError(401) if token is missing, invalid, or expired
 * @throws HttpError(403) if decodedToken.admin !== true or user cannot be verified as an ADMIN
 */
export async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError('Missing or invalid Authorization header. Expected "Bearer <token>"', 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new HttpError('Bearer token is empty', 401);
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (err: any) {
    throw new HttpError(
      `Authentication failed: ${err?.message || 'Invalid or expired Firebase ID token'}`,
      401
    );
  }

  if (!decodedToken?.uid) {
    throw new HttpError('Invalid token payload: missing UID', 401);
  }

  if (decodedToken.admin !== true) {
    throw new HttpError('Forbidden: Admin privileges required. Missing admin custom claim.', 403);
  }

  let user = await prisma.user.findUnique({
    where: { firebaseUid: decodedToken.uid },
    include: {
      sellers: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || 'Platform Administrator',
        role: 'ADMIN',
        isDemo: false,
      },
      include: {
        sellers: true,
      },
    });
  } else if (user.role !== 'ADMIN') {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
      include: {
        sellers: true,
      },
    });
  }

  return user;
}

/**
 * Helper to catch and format HttpErrors into standard JSON responses.
 */
export function handleAuthError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status }
    );
  }

  return NextResponse.json(
    { success: false, error: (error as any)?.message || 'Internal server error' },
    { status: 500 }
  );
}
