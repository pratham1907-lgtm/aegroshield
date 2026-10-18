import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Content-Type': 'application/json',
};

/**
 * GET /api/health
 *
 * Checks database connectivity using a lightweight Prisma query.
 * Returns:
 *   - 200 OK with { status: 'ok', database: 'connected', ... } if healthy.
 *   - 503 Service Unavailable with { status: 'degraded', database: 'disconnected', ... } if degraded.
 * Configured with no-cache headers for external uptime ping services.
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Lightweight database ping
    await prisma.$queryRaw`SELECT 1`;

    const responseTimeMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        latencyMs: responseTimeMs,
        uptime: typeof process.uptime === 'function' ? Math.floor(process.uptime()) : 0,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime;
    console.error('[API/Health] Database health check failed:', error?.message || error);

    // Track critical database outage in Sentry with instant alert tags
    Sentry.captureException(error, {
      level: 'fatal',
      tags: {
        service: 'database',
        endpoint: '/api/health',
        critical: 'true',
        error_type: 'database_timeout',
        alert_priority: 'P1',
      },
      extra: {
        healthStatus: 'degraded',
        latencyMs: responseTimeMs,
      },
    });

    // Fail safely with 503 Service Unavailable without exposing stack traces or DB credentials
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'disconnected',
        error: 'Database unavailable',
        latencyMs: responseTimeMs,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: NO_CACHE_HEADERS,
      }
    );
  }
}

/**
 * HEAD /api/health
 *
 * Supported for external uptime ping services that use HEAD requests to verify availability.
 */
export async function HEAD() {
  const getResponse = await GET();
  return new NextResponse(null, {
    status: getResponse.status,
    headers: getResponse.headers,
  });
}
