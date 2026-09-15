import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Mirror Next.js's env file precedence (.env, then .env.local overriding it) — plain
// `dotenv/config` only loads `.env`, which would leave Prisma Migrate reading the placeholder
// DATABASE_URL from `.env` instead of the real one developers keep in the gitignored
// `.env.local`.
loadEnv();
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
