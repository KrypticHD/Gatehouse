import { z } from "zod";

/**
 * Server-side environment schema.
 *
 * Nothing in this phase's UI actually reads `DATABASE_URL` or the auth-related variables
 * yet (wallet auth is a placeholder until the next phase — see docs/build-progress.md), so
 * they are declared here for the schema/config they already back (Prisma, future SIWE) but
 * kept optional so `next dev` / `next build` never fail on a missing `.env`. They become
 * effectively required the moment a route actually uses them, because that route will fail
 * loudly instead of silently reading `undefined`.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /** Postgres connection string, consumed by src/server/db/client.ts (Prisma driver adapter). */
  DATABASE_URL: z.string().url().optional(),

  /**
   * Secret used to encrypt the session cookie (iron-session). Required to be at least 32
   * characters once wallet authentication ships. Generate with:
   *   openssl rand -base64 32
   */
  SESSION_SECRET: z.string().min(32).optional(),

  /** Chain ID Gatehouse treats as the default network for local/staging development. */
  NEXT_PUBLIC_DEFAULT_CHAIN_ID: z.coerce.number().int().positive().default(11155111),

  /** Public origin used to build the SIWE message `domain`/`uri` fields. */
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  /** WalletConnect Cloud project ID, required by RainbowKit's connector list. */
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),

  /** JSON-RPC URL for the default development chain (Sepolia), used for balance reads. */
  SEPOLIA_RPC_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function loadEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid environment configuration:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment configuration. See .env.example.");
  }
  return parsed.data;
}

export const env = loadEnv();
