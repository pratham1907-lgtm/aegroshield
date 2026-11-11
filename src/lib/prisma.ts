import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getOptimizedDatabaseUrl(): string {
  let url = process.env.DATABASE_URL;

  if (!url) {
    // Graceful fallback for Next.js build-time static page collection
    return 'postgresql://postgres:postgres@localhost:5432/postgres?connection_limit=1&connect_timeout=20';
  }

  // 1. Ensure connection limit is set for serverless environments (1 connection per lambda to avoid exhausting pool)
  if (!url.includes('connection_limit=')) {
    url += (url.includes('?') ? '&' : '?') + 'connection_limit=1';
  }

  // 2. Ensure connection timeout is bounded
  if (!url.includes('connect_timeout=')) {
    url += '&connect_timeout=20';
  }

  // 3. Ensure pgbouncer=true for Supabase/PostgreSQL Transaction Pooler (port 6543 or pooler host)
  const isPooler = url.includes(':6543') || url.includes('pooler.supabase.com') || url.includes('pgbouncer');
  if (isPooler && !url.includes('pgbouncer=true')) {
    url += '&pgbouncer=true';
  }

  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getOptimizedDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
