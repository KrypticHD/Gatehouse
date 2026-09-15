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
 * schema. Cached on `global` so Next.js dev-mode module reloads reuse one pg pool instead
 * of opening a new one per request.
 */
export const prisma = globalThis.__gatehousePrisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalThis.__gatehousePrisma = prisma;
}
