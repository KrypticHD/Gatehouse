# Gatehouse — Architecture

## Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) | Deployed to Vercel; server components by default |
| Language | TypeScript, `strict: true` | `tsconfig.json`; target ES2022 (needed for native `BigInt` literals) |
| Styling | Tailwind CSS v4 | Design tokens as CSS variables in `src/app/globals.css`, exposed via `@theme inline` |
| Database | PostgreSQL | No local disk state; managed Postgres in every environment |
| ORM | Prisma 7 | Uses the new `prisma-client` generator + explicit driver adapter (see below) |
| Wallet connection | wagmi 2.x + viem + RainbowKit | **Pinned to wagmi v2**, not v3 — see "Resolved technical choices" |
| Auth | Sign-In with Ethereum (EIP-4361) | Not implemented yet; see docs/build-progress.md |
| Sessions | iron-session (encrypted HttpOnly cookie) + a `Session` DB row | Cookie holds a pointer, not the source of truth — see docs/security.md |
| Validation | Zod | `src/lib/validation/*`, `src/server/env.ts` |
| Tests | Vitest | Pure-function unit tests only in this phase (`src/**/*.test.ts`) |

Nothing in this phase requires a persistent local disk, an always-on process, or in-memory
production state — Vercel hosts the app/API, Postgres is external and managed, and the only
scheduled/background work (subscription charge jobs) is explicitly future and will be a
managed job, not a long-running process this repo owns.

## Why wagmi is pinned to v2

wagmi 3.x is published, but RainbowKit 2.2.11 (the latest release as of this phase) still
declares a `^2.9.0` peer dependency on wagmi and has not published a wagmi-v3-compatible
version. Installing wagmi v3 alongside RainbowKit produces an unresolved peer dependency and
an untested combination. `package.json` pins `wagmi@2.19.5`; revisit this pin once
RainbowKit ships wagmi v3 support.

## Why Prisma uses a driver adapter instead of a schema `url`

Prisma 7 removed `datasource.url` from `schema.prisma` — Migrate reads `DATABASE_URL` from
`prisma.config.ts` (via `dotenv/config`), and `PrismaClient` at runtime takes an explicit
driver adapter instead of reading the schema's connection string. Gatehouse uses
`@prisma/adapter-pg` (`pg` under the hood). See `src/server/db/client.ts`, which throws a
clear error if `DATABASE_URL` is unset rather than silently connecting to nothing. The
client is cached on `globalThis` so Next.js's dev-mode module reloads reuse one connection
pool instead of leaking one per reload.

## Data model

Full schema: [`prisma/schema.prisma`](../prisma/schema.prisma). Key decisions:

- **Immutable ID vs. mutable slug.** Every `Community` has a `cuid()` `id` that is never
  reassigned or exposed for editing, and a separate unique `slug` that can change safely.
  Nothing references a community by slug internally.
- **Four independent status axes on `Community`:** `lifecycleStatus`, `verificationStatus`,
  `publicationStatus`, plus `CommunitySubscription.status` for billing. None of these imply
  another — a community can be published and unverified, verified and unpublished, etc.
  `verificationStatus` is a denormalized copy of `CommunityVerification.status` (kept in
  sync in the same transaction) so Explore-page filtering never needs a join.
- **Reserved platform identity.** `Community.isPlatformCommunity` and the slug `gatehouse`
  (see `RESERVED_COMMUNITY_SLUGS` in `src/lib/validation/community-draft.ts`) are reserved
  for the platform's own community. In this phase the restriction is enforced only in the
  Zod schema; a future phase should also enforce it with a partial unique index or a
  database check constraint so it can't be bypassed by a direct write.
- **Tokens are identified by `(chainId, tokenContractAddress)`, never by ticker.** This pair
  lives on `CommunityAccessRule`, not on `Community` itself, so a community can gain
  additional or tiered access rules later (e.g. participation levels) without a schema
  migration that touches `Community`.
- **On-chain amounts are exact integers.** `minimumTokenBalance`, `amountWei` (deposits and
  charges) are `Decimal @db.Decimal(78, 0)` — scale 0 forces integer-only storage, and
  precision 78 comfortably covers a `uint256`. Nothing on-chain-amount-shaped is ever a
  `Float` or JS `Number`. Conversion between a human-entered decimal string and the raw
  integer is centralized in `src/lib/token-amount.ts`, using string/`BigInt` arithmetic only
  (never `parseFloat`).
- **Billing ledger, not a mutable balance.** `CommunitySubscription` has no "current credit"
  column. Spendable credit is always `sum(SubscriptionDeposit.amountWei where confirmed) -
  sum(SubscriptionCharge.amountWei where succeeded)`, computed on read. This is what keeps
  unused prepaid credit distinguishable from money Gatehouse has actually recognized as
  revenue — a missed status update can't silently merge the two.
- **Authorization scoping.** `CommunityAdministrator` is a join row keyed on
  `(communityId, userId)`. Every admin-only request must look up this row for the specific
  `communityId` in the URL; being an admin of one community must never be treated as
  authorization for another. See docs/security.md.

## Module boundaries (what's real vs. planned)

| Module | This phase | Integration point when it lands |
| --- | --- | --- |
| Wallet auth (SIWE) | Not implemented; `WalletButtonPlaceholder` component only | `src/server/env.ts` already reserves `SESSION_SECRET`; nonce issuance will use `AuthenticationNonce`, verification will use viem (`verifyMessage`/`recoverMessageAddress`) rather than the `ethers`-dependent `siwe` npm package, avoiding an unused second web3 library alongside wagmi/viem |
| Eligibility checking | Pure decision logic only (`src/lib/eligibility.ts`), unit-tested; no live RPC call | A future `checkAccessRule(rule, walletAddress)` will call `viem`'s `readContract` for `balanceOf`, wrap failures as `{ ok: false, reason }`, and feed the result into `evaluateAccessRule` unchanged |
| Announcements / discussions | UI components only, reading fixture data | CRUD routes will authorize via `CommunityAdministrator` (write) and `evaluateCommunityEligibility` (holder read) |
| Billing | Schema only (`CommunitySubscription`, `SubscriptionDeposit`, `SubscriptionCharge`) | A future billing contract emits deposit events; a scheduled job (Vercel Cron or a queue) writes `SubscriptionCharge` rows — no such job exists yet |
| Voting | Not modeled beyond being a planned filter in the Explore UI | Needs its own snapshot/ballot tables once designed; deliberately not built early to avoid a schema no one has validated against a real design |
| Rewards | Not modeled beyond being a planned filter in the Explore UI | Same reasoning as voting |
| $GATE | No contract, no addresses, no allocation | Gatehouse's own community row will be seeded with `isPlatformCommunity: true` once the platform community is created for real |

## Resolved technical choices

- Prisma 7 (`prisma`/`@prisma/client` pinned to `7.10.0`, matching versions) over the
  `8.0.0-rc.x` line currently tagged `latest` on npm — this phase avoids depending on a
  release candidate.
- wagmi pinned to the v2 line for RainbowKit compatibility (see above).
- SIWE will be hand-implemented against viem instead of adding the `siwe` npm package,
  because `siwe@3` hard-depends on `ethers` as a peer, which would sit unused next to
  wagmi/viem for no benefit.
- ESLint + Prettier (with `prettier-plugin-tailwindcss`) for linting/formatting; Vitest for
  unit tests.

## Explicitly unresolved (not decided in this phase)

- Production blockchain network(s) — development defaults to Sepolia
  (`NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155111`); production network selection is untouched.
- Hosting/provider for production Postgres, and for RPC access (Alchemy/Infura/other).
- Billing contract design, low-balance/grace-period/pause/withdrawal rules.
- $GATE supply, allocation, vesting, liquidity, and contract address.
- Voting snapshot mechanism and rewards funding mechanism.
- Whether `CommunityAdministrator` needs more than `OWNER`/`MANAGER` roles once real teams
  use it.
