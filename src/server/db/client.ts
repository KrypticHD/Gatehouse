import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/server/env";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var __gatehousePrisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure a Postgres connection string.",
    );
  }
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

/**
 * Prisma 7 requires an explicit driver adapter instead of reading DATABASE_URL from the
 * schema. The real client is only constructed the first time a query actually runs — not at
 * module import time — because Next.js's build-time page-data collection imports every route
 * module's dependency graph (including this one) without ever calling into it, and a route
 * that merely imports `prisma` must not fail to build just because no database is configured
 * yet. Cached on `global` so dev-mode module reloads reuse one pg pool instead of opening a
 * new one per request.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    if (!globalThis.__gatehousePrisma) {
      globalThis.__gatehousePrisma = createPrismaClient();
    }
    return Reflect.get(globalThis.__gatehousePrisma, property, receiver);
  },
});
