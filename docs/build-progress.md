# Gatehouse — Build progress

## Phase 1 (this phase): scaffold, schema, brand shell, Explore page

### Implemented

- Next.js 16 App Router project, TypeScript `strict: true`, Tailwind v4, ESLint, Prettier.
- Approved design tokens (`src/app/globals.css`) and a flat interface mark
  (`src/components/brand/GatehouseMark.tsx`); the full 3D marketing mark is in
  `public/brand/gatehouse-mark-3d.png`.
- Mobile-first app shell: `src/components/layout/Header.tsx` (compact header, no fixed
  bottom nav, hamburger disclosure below `md`) wired into `src/app/layout.tsx`.
- Public Explore page (`src/app/page.tsx`): headline, disconnected-state banner, search,
  All/Discussions/Voting/Rewards filters, community cards, "illustrative development data"
  labelling, Create-community CTA. Voting/Rewards filters show an honest "planned module,
  coming soon" empty state rather than fake results.
- Reusable components: `Header`, `WalletButtonPlaceholder`, `SearchBar`, `FilterTabs`,
  `CommunityCard`, `StatusBadge`, `EmptyState`, `LoadingState`, `ErrorState`.
- Prisma schema (`prisma/schema.prisma`) covering every model the brief requires, four
  independent status enums on `Community`, and a Prisma-7 driver-adapter client
  (`src/server/db/client.ts`, `@prisma/adapter-pg`).
- Pure, unit-tested domain logic: `src/lib/address.ts`, `src/lib/token-amount.ts`,
  `src/lib/eligibility.ts`, `src/lib/validation/community-draft.ts` — 32 Vitest tests, all
  passing.
- `src/server/env.ts` (Zod-validated env) and `.env.example` with descriptions, no
  credentials.
- `docs/product.md`, `docs/architecture.md`, `docs/security.md`, this file, and `README.md`.

### Deliberately not implemented (by design, not oversight)

- **Wallet authentication.** `WalletButtonPlaceholder` is inert — no wagmi/RainbowKit
  provider is mounted in the app tree, no signature is requested, no session is created.
  This was a direct instruction ("do not implement fake wallet authentication"; the wallet
  button "may remain a clearly marked interface placeholder until the next phase").
- **Live token-balance reads.** `evaluateAccessRule`/`evaluateCommunityEligibility` are
  fully implemented and tested, but nothing calls a real RPC provider yet — there's no
  wallet session to check a balance for.
- **Announcement/discussion authoring, moderation actions, verification review, billing
  deposits/charges.** Schema exists; no routes exist.
- **Any smart contract or real blockchain transaction.** None exist in this repo.

### Fixture data

`src/lib/fixtures/communities.ts` — 4 illustrative communities (Gatehouse/$GATE itself,
Moon Pigeon/$COO, Sunny Toast/$TOAST, Quiet Cat Collective/$MEOW), covering verified,
pending, and unverified badges and both configured networks (Ethereum, Sepolia). This is
**not** database data; the Explore page reads it directly and labels it as illustrative in
the UI.

## Checks run

| Check | Command | Result |
| --- | --- | --- |
| Type check | `npm run typecheck` (`tsc --noEmit`) | Pass, 0 errors |
| Lint | `npm run lint` (`eslint .`) | Pass, 0 errors/warnings |
| Unit tests | `npm test` (`vitest run`) | Pass, 32/32 tests, 4 files |
| Production build | `npm run build` | Succeeds (`next build`, static Explore page) |
| Prisma schema | `npx prisma validate` | Valid |
| Prisma client generation | `npx prisma generate` | Succeeds, output at `src/generated/prisma` |
| Visual/manual QA | Dev server at 375×812 and desktop widths | Header, wallet placeholder, search, filters (including the Voting/Rewards planned-module empty state), and card grid all verified in-browser |

**Not run in this phase:** `prisma migrate dev` / an applied migration against a real
database — there is no Postgres instance available in this environment. See "Configuration
still required" below.

## Configuration still required

1. **A Postgres database and `DATABASE_URL`.** Copy `.env.example` to `.env`, point
   `DATABASE_URL` at a real (e.g. local or Neon/Supabase) Postgres instance, then run
   `npm run db:migrate` to generate and apply the first migration. This has not been run
   anywhere yet — the schema is validated (`prisma validate`) and the client generates
   (`prisma generate`), but no migration file exists on disk because there was no database
   to diff against.
2. **`SESSION_SECRET`** (32+ characters, e.g. `openssl rand -base64 32`) before wallet auth
   is wired up in the next phase.
3. **`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`** (from WalletConnect Cloud) before RainbowKit
   is mounted for real.
4. **An RPC URL** (`SEPOLIA_RPC_URL`, e.g. from Alchemy/Infura) for live balance reads.
5. Real project artwork/uploads storage is unresolved — the Explore page currently uses
   emoji placeholders instead of `artworkUrl` images.

## Blockers

None. Everything scoped for this phase runs and verifies without the items in
"Configuration still required" — those are inputs needed for the *next* phase, not failures
in this one.

## Recommended next phase

Implement wallet authentication end-to-end: SIWE nonce issuance route, signature
verification with viem (`verifyMessage`), `Session`/`Wallet`/`User` creation, iron-session
cookie wiring, and mount the RainbowKit/wagmi provider to replace `WalletButtonPlaceholder`
with a real "Connect wallet" flow. Follow it immediately with the first live
`CommunityAccessRule` balance check (`viem.readContract` + `evaluateAccessRule`) so community
discovery becomes real instead of fixture-based.
