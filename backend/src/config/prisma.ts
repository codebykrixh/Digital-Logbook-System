import { PrismaClient } from '@prisma/client';
import { isProd } from './env';

/**
 * Single shared Prisma client. In development we cache it on `globalThis`
 * to survive hot-reloads (tsx watch) and avoid exhausting DB connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['error', 'warn'],
  });

if (!isProd) globalForPrisma.prisma = prisma;
