import { z } from "zod";

/**
 * Server-side environment schema.
 *
 * `DATABASE_URL`, `SEPOLIA_RPC_URL` and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` are optional
 * so `next dev` / `next build` never fail on a `.env` that leaves them blank — a route that
 * actually needs one fails loudly at request time instead (see src/server/db/client.ts).
 * `.env.local` may set these to `""` rather than omitting them entirely, so blank strings are
 * treated the same as unset before the `.url()` check runs.
 */
const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /** Postgres connection string, consumed by src/server/db/client.ts (Prisma driver adapter). */
  DATABASE_URL: optionalUrl,

  /**
   * Secret used to encrypt the session cookie (iron-session). Generate with:
   *   openssl rand -base64 32
   */
  SESSION_SECRET: z.string().min(32).optional(),

  /** Chain ID Gatehouse treats as the default network for local/staging development. */
  NEXT_PUBLIC_DEFAULT_CHAIN_ID: z.coerce.number().int().positive().default(11155111),

  /** Public origin used to build the SIWE message `domain`/`uri` fields. */
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  /** WalletConnect Cloud project ID, used by the RainbowKit wallet connectors (src/lib/wagmi-config.ts). */
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),

  /** JSON-RPC URL for the default development chain (Sepolia), used for balance reads. */
  SEPOLIA_RPC_URL: optionalUrl,

  /**
   * Shared secret gating the pre-launch app (`/app` and below) behind `/preview?code=...`
   * (src/middleware.ts). The public "coming soon" landing page at `/` needs no code.
   * Unset means `/app` is blocked outright — fail closed, not open.
   */
  PREVIEW_ACCESS_CODE: z.string().min(8).optional(),

  /** The Gatehouse project's X (Twitter) profile, linked from the landing page nav. Unset hides the link. */
  NEXT_PUBLIC_GATEHOUSE_X_URL: optionalUrl,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function loadEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration. See .env.example.");
  }
  return parsed.data;
}

export const env = loadEnv();
