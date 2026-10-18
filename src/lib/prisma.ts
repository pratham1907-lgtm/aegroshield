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

  if (!url.includes('connection_limit=')) {
    url += (url.includes('?') ? '&' : '?') + 'connection_limit=1';
  }
  if (!url.includes('connect_timeout=')) {
    url += '&connect_timeout=20';
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
