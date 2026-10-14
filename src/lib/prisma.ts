import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getOptimizedDatabaseUrl(): string {
  let url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      '[Prisma] Missing DATABASE_URL environment variable. Please ensure it is defined in your environment (.env / .env.production).'
    );
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
