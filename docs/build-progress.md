# Gatehouse — Build progress

## Phase 2: wallet authentication (Sign-In with Ethereum)

### Implemented

- **Real wallet connection**, browser-injected connector only (MetaMask/Rabby/Coinbase
  Wallet extension etc.) via wagmi — no WalletConnect Cloud project ID configured or
  required (`src/lib/wagmi-config.ts`, `src/app/providers.tsx`). Replaces
  `WalletButtonPlaceholder` with `src/components/wallet/ConnectWalletButton.tsx`.
- **Full SIWE (EIP-4361) flow**, hand-built on viem rather than the `ethers`-dependent `siwe`
  package (see docs/architecture.md):
  - `POST /api/auth/nonce` — issues a one-use, expiring nonce (`src/server/auth/nonce.ts`)
    and returns the exact message to sign (`src/lib/siwe.ts`, unit-tested).
  - `POST /api/auth/verify` — recovers the signing address with viem's
    `recoverMessageAddress` against a message the **server rebuilds from its own stored
    nonce row**, never from client-supplied text (`src/server/auth/verify-signature.ts`).
    Creates the `User`/`Wallet` on first sign-in, marks the nonce consumed (replay-proof),
    and opens a `Session` row.
  - `GET /api/auth/session` / `POST /api/auth/logout` — session read/revoke.
  - `src/server/auth/session.ts` — iron-session HttpOnly cookie holding only a session-ID
    pointer; the `Session` DB row (not the cookie) is the source of truth, so a revoked
    session stops working immediately.
- Added `AuthenticationNonce.uri` to the schema (needed to rebuild the signed message
  byte-for-byte) and generated the **first real migration**, `20260915112301_init`, applied
  against a live Prisma Postgres database.
- Fixed the Prisma client to construct lazily (via a `Proxy`) instead of at module import —
  eager construction crashed `next build`'s page-data collection for any route that merely
  imported `prisma` when `DATABASE_URL` wasn't set yet.
- Explore page's guest line (`ConnectionStatusLine`) now reflects real session state instead
  of a hardcoded string.

### Infrastructure provisioned

- **Prisma Postgres** (via Vercel Marketplace, one-time ToS click by the account owner —
  Claude cannot accept marketplace terms) — `DATABASE_URL`/`POSTGRES_URL`/
  `PRISMA_DATABASE_URL` connected to the Vercel project across Production/Preview/Development.
- Replaced several placeholder-looking Vercel env values (`SESSION_SECRET`,
  `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_DEFAULT_CHAIN_ID`) with known-good real ones; removed
  `SEPOLIA_RPC_URL`/`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` entirely rather than leaving
  possibly-garbage values, since both are safe to be unset in this phase (public default RPC,
  injected-only wallet connection).

### Verified end-to-end (not just unit-tested)

Simulated a real wallet (viem `privateKeyToAccount` + `signMessage`) against the running dev
server, against the real provisioned database:
nonce issuance → message signed → `POST /api/auth/verify` → `200 { ok: true }` with a
`Set-Cookie` → `GET /api/auth/session` with that cookie → `{ authenticated: true, address,
chainId }` → replaying the same nonce+signature → `409 nonce_already_used`.

### Still not implemented

- **Live token-balance reads.** `evaluateAccessRule` is implemented and tested, but no route
  calls a real RPC provider yet to check a connected wallet's balance against a
  `CommunityAccessRule`.
- **Chain-switching UX.** The wagmi config only lists Sepolia/Ethereum; a wallet on another
  network will fail nonce validation with a generic error rather than being prompted to
  switch.
- **WalletConnect** (mobile QR pairing) — deferred until a project ID exists; the connector
  list is a one-line addition when it does.
- Announcement/discussion authoring, moderation, verification review, billing — unchanged
  from Phase 1, still schema-only.

### Checks run (Phase 2)

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | Pass, 37/37 |
| `npm run build` | Succeeds; the 4 auth routes correctly report as dynamic (ƒ) |
| `npx prisma migrate dev --name init` | Applied against live Prisma Postgres |
| End-to-end SIWE flow | Verified against the live dev server + real database (see above) |

## Recommended next phase

Wire a real `checkAccessRule(rule, walletAddress)` using viem's `readContract` for ERC-20
`balanceOf`, feed it into the already-tested `evaluateAccessRule`/`evaluateCommunityEligibility`,
and make the Explore page query real `Community`/`CommunityAccessRule` rows (once any exist)
instead of fixtures for a signed-in wallet — fixtures should remain for the logged-out/demo
view. After that: the project-owner community-creation flow (the `communityDraftSchema`
validation already exists and is unit-tested, but no form or route uses it yet).

## Phase 1: scaffold, schema, brand shell, Explore page

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

### Checks run (Phase 1)

| Check | Command | Result |
| --- | --- | --- |
| Type check | `npm run typecheck` (`tsc --noEmit`) | Pass, 0 errors |
| Lint | `npm run lint` (`eslint .`) | Pass, 0 errors/warnings |
| Unit tests | `npm test` (`vitest run`) | Pass, 32/32 tests, 4 files |
| Production build | `npm run build` | Succeeds (`next build`, static Explore page) |
| Prisma schema | `npx prisma validate` | Valid |
| Prisma client generation | `npx prisma generate` | Succeeds, output at `src/generated/prisma` |
| Visual/manual QA | Dev server at 375×812 and desktop widths | Header, wallet placeholder, search, filters (including the Voting/Rewards planned-module empty state), and card grid all verified in-browser |

### Configuration items from Phase 1 — resolved in Phase 2

1. ~~A Postgres database and `DATABASE_URL`~~ — **done**: Prisma Postgres provisioned, first
   migration applied.
2. ~~`SESSION_SECRET`~~ — **done**: real value set locally and on Vercel.
3. **`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`** — still not set; still not needed (see Phase 2
   "Still not implemented").
4. **An RPC URL (`SEPOLIA_RPC_URL`)** — still not set; still not needed, viem's public default
   is used instead.
5. Real project artwork/uploads storage is still unresolved — the Explore page still uses
   emoji/monogram placeholders instead of `artworkUrl` images.
