import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 *
 * Checks database connectivity using a lightweight Prisma query.
 * Returns 200 if database responds, or 503 Service Unavailable
 * with a sanitized error message if degraded/offline.
 */
export async function GET() {
  try {
    // Lightweight database ping
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API/Health] Database health check failed:', error?.message || error);

    // Track database outage in Sentry
    Sentry.captureException(error, {
      tags: { service: 'database', endpoint: '/api/health' },
      extra: { healthStatus: 'degraded' },
    });

    // Fail safely with 503 Service Unavailable without exposing stack traces or DB credentials
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'disconnected',
        error: 'Database unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
