import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString =
  (typeof process !== "undefined" && process.env && process.env.DATABASE_URL) ||
  "postgresql://postgres:postgres123@localhost:5432/breastcare_ai?schema=public";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaConnectionString: string | undefined;
  pool: pg.Pool | undefined;
};

if (!globalForPrisma.prisma || globalForPrisma.prismaConnectionString !== connectionString) {
  if (globalForPrisma.pool) {
    try {
      globalForPrisma.pool.end().catch(() => {});
    } catch (_) {}
  }
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = new PrismaClient({ adapter });
  globalForPrisma.prismaConnectionString = connectionString;
}

export const prisma = globalForPrisma.prisma;

