# Gatehouse — Build progress

## Phase 3: public "coming soon" landing page

### What changed

The public root route (`/`) is now a pre-launch marketing/waitlist landing page, not the
Explore app. The Explore app (Phase 1/2's work) still exists unchanged, moved to `/app`
behind a preview gate — real users cannot reach it yet.

- **`src/app/page.tsx`** — the landing page: hero with the 3D orb art, animated orbit rings
  and token chips, a 3-step "how it works" flow, feature grid, $GATE utility panel, final
  CTA, footer. Ported from a supplied design (bespoke CSS, not Tailwind utilities) and
  scoped entirely under a `.coming-soon-page` class (`src/app/coming-soon.css`) so none of
  it can leak onto `/app`, which keeps using the existing Tailwind-based design system.
- **`src/app/waitlist-form.tsx`** + **`POST /api/waitlist`** — email capture, adapted from
  the supplied design's Cloudflare D1/Drizzle backend to our existing Prisma/Postgres setup.
  New `WaitlistSignup` model (migration `20260915120714_add_waitlist_signup`). Duplicate
  emails get a friendly "already on the list" response (Prisma `P2002` → distinct message)
  rather than an error; a honeypot field silently no-ops bot submissions without a DB write.
- **`src/middleware.ts`** (renamed to `src/proxy.ts` — see below) + **`src/app/preview/route.ts`**
  — everything under `/app` is blocked unless the visitor's browser holds a cookie matching
  `PREVIEW_ACCESS_CODE`, set by visiting `/preview?code=<the code>`. No code configured means
  `/app` is blocked outright (fail closed). This is a staging/obscurity gate, not real
  authorization — it doesn't replace or interact with the SIWE session system.
- **Route restructuring**: the root layout (`src/app/layout.tsx`) is now minimal (just
  `<html>`/`<body>`, Geist font loading) since it wraps both the landing page and the gated
  app. The old Header+Providers+padded-container app shell moved to
  `src/app/(gated)/layout.tsx`, applied only to `src/app/(gated)/app/page.tsx` (the moved
  Explore page). Header nav links updated from `/`, `/my-communities`, `/rewards` to
  `/app`, `/app/my-communities`, `/app/rewards`.
- Copied the supplied `gatehouse-orb.webp` 3D mark into `public/brand/`; added `lucide-react`
  (the icon set the design was built with) as a real dependency rather than hand-approximating
  8 icons.
- **X (Twitter) link**: wired up via `NEXT_PUBLIC_GATEHOUSE_X_URL` (renders nothing if unset,
  as it is today) — not supplied yet, so the nav's "Follow on X" link is currently hidden.
  Set this env var once a handle exists; no code change needed.

### Renamed `middleware.ts` → `proxy.ts`

Next.js 16.3.5 deprecated the `middleware.ts` file convention in favor of `proxy.ts` (same
API, same `config.matcher`, just `export function proxy` instead of `export function
middleware`). Migrated with the official codemod
(`npx @next/codemod@canary middleware-to-proxy .`) rather than leaving a deprecation warning
in a freshly-built project.

### An unrelated foreign project appeared in the repo root

A separate "ComingSoon" scaffold (its own `package.json`, `pnpm-lock.yaml`, Vite/Cloudflare
config, `node_modules` not installed) was placed directly in the repository root — this is
where the supplied landing-page design actually lived. It is **not** part of the Gatehouse
app and was left untouched (per policy: never delete/modify content that appeared outside
this session's own actions without being asked). `tsconfig.json`, `eslint.config.mjs`, and
`.prettierignore` were updated to exclude it so Gatehouse's own typecheck/lint/build don't
fail on its uninstalled dependencies. It can be deleted once nothing further needs porting
from it — everything needed (page markup, CSS, waitlist form, 3D art asset) has already been
extracted into the files listed above.

### Configuration added

- **`PREVIEW_ACCESS_CODE`** — required for `/app` to be reachable at all; set locally and in
  all three Vercel environments (generated fresh, not shared with any other secret).
- **`NEXT_PUBLIC_GATEHOUSE_X_URL`** — optional, unset today; see above.

### Checks run (Phase 3)

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass (one pre-existing-pattern warning: `<img>` instead of `next/image` for the hero art, kept deliberately — see below) |
| `npm test` | Pass, 37/37 |
| `npm run build` | Succeeds; `/` and `/app` both static, `/preview` and all `/api/*` dynamic, proxy (middleware) active |
| `prisma migrate dev` | Applied `add_waitlist_signup` against the live database |
| Preview gate | Verified via direct HTTP requests: `/app` without cookie → 307 to `/`; `/preview?code=wrong` → 307 to `/`; `/preview?code=<real>` → sets cookie, redirects to `/app`; `/app` with cookie → 200 |
| Waitlist API | Verified via direct HTTP requests against the live database: new email → success message; same email again → "already on the list" message, no duplicate row |
| Visual — landing page hero | Verified in-browser (375px-equivalent and desktop): matches the supplied design — headline, orbit animation, token chips, access card, waitlist form all render and are interactive |
| Visual — landing page below the fold | **Not fully re-verified visually.** The browser automation tool in this session hit a GPU-compositor fault partway through testing (an explicit Chromium `UnknownVizError`, plus intermittent blank-frame screenshots on scroll that didn't match the underlying DOM/CSSOM state, reproduced across dev and production builds and fresh tabs). DOM inspection at every checkpoint confirmed correct markup, computed styles, and element geometry for the sections below the hero (feature grid, token panel, final CTA including its waitlist form). Treat this as code-reviewed and DOM-verified, not pixel-verified — worth a quick manual look once deployed. |

### Why `<img>` instead of `next/image` for the hero art

The ported CSS sizes/positions the hero image with plain percentage/aspect-ratio rules
(`.hero-art > img { width: 70%; ... }`) and animates it directly. `next/image`'s `fill` mode
(the only mode compatible with a responsive, non-fixed-dimension parent) sets its own inline
`position`/`width`/`height`, which — being inline styles — would override those rules and
break the design. Kept as a plain `<img>` to preserve the exact supplied animation/sizing
rather than restructure the CSS around `next/image`'s constraints.

## Phase 2: wallet authentication (Sign-In with Ethereum)

### Implemented

- **Real wallet connection via RainbowKit**: MetaMask (or any browser-injected wallet),
  WalletConnect (any mobile wallet, via QR/deep link — no extension required), Coinbase
  Wallet, and Rainbow (`src/lib/wagmi-config.ts`, `src/app/providers.tsx`, themed to match
  brand). Replaces `WalletButtonPlaceholder` with
  `src/components/wallet/ConnectWalletButton.tsx`, which uses `ConnectButton.Custom` for the
  connect step (styled as our own coral button, opening RainbowKit's wallet-picker modal) and
  keeps the SIWE sign-in step as a separate explicit action.
  - Initially shipped with only the browser-injected connector (no WalletConnect project ID)
    to unblock quickly; switched to full RainbowKit once real usage surfaced the obvious gap
    — anyone without a desktop extension (most notably every mobile user) couldn't connect
    at all. A platform meant for "all" users needs WalletConnect, not just MetaMask.
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
  `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_DEFAULT_CHAIN_ID`) with known-good real ones.
- **`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`** — a real project ID (from
  cloud.walletconnect.com) is now set in all environments. `SEPOLIA_RPC_URL` remains unset;
  viem's public default RPC is still used for now.

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
- **WalletConnect QR pairing to a real mobile wallet has not been tested with an actual
  phone** — only verified that the modal renders correctly and lists WalletConnect as an
  option; the underlying protocol is well-established but this specific integration should
  get a real device test.
- Announcement/discussion authoring, moderation, verification review, billing — unchanged
  from Phase 1, still schema-only.

### Fixed: build failure from RainbowKit's default wallet list

`getDefaultConfig()`'s default wallet set includes Coinbase's "Base Account" connector,
which pulls in `@coinbase/cdp-sdk` and optional Solana/x402-payment sub-packages that aren't
installed — Next's bundler tried to statically resolve those dynamic imports and failed the
build. Fixed by using a curated wallet list (`connectorsForWallets`) that excludes it, plus
`serverExternalPackages` in `next.config.ts` for the offending packages. See
docs/architecture.md "Why RainbowKit uses a curated wallet list".

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
3. ~~`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`~~ — **done**: real project ID set, full
   RainbowKit wallet modal wired up.
4. **An RPC URL (`SEPOLIA_RPC_URL`)** — still not set; still not needed, viem's public default
   is used instead.
5. Real project artwork/uploads storage is still unresolved — the Explore page still uses
   emoji/monogram placeholders instead of `artworkUrl` images.
