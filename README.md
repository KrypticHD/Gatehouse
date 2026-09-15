# Gatehouse

Gatehouse gives crypto tokens useful community functions. Connect one wallet, sign one
message, and automatically discover every community your token holdings unlock.

> **Your token. Your people.** One wallet. Find your community.

**Live:** https://gatehouse-ten.vercel.app

This is a mobile-first website (not a native app, not a Discord product). See
[`docs/product.md`](docs/product.md) for the full product vision,
[`docs/architecture.md`](docs/architecture.md) for the technical design, and
[`docs/build-progress.md`](docs/build-progress.md) for exactly what's implemented vs.
planned in the current phase.

## Current status

- **`/`** — the public "coming soon" landing page (email waitlist). This is what any
  ordinary visitor sees.
- **`/app`** — the pre-launch Explore app (wallet auth, community discovery,
  project-owner community creation at `/app/create`). Blocked for everyone by default — see
  "The pre-launch app is gated" below.

See [`docs/build-progress.md`](docs/build-progress.md) for the full checklist of what's real
vs. planned, and the recommended next phase.

## Requirements

- Node.js `^20.19 || ^22.12 || >=24.0` (developed against Node 24)
- npm (ships with Node)
- A PostgreSQL database — required for anything beyond the landing page (waitlist signups,
  wallet auth, the Explore app's session checks)

## Local development

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` — see the comments in `.env.example` for what each variable is for and
where to get it. At minimum for local development:

- `DATABASE_URL` — a real Postgres connection string.
- `SESSION_SECRET` — any random 32+ character string (`openssl rand -base64 32`); doesn't
  need to match production.
- `PREVIEW_ACCESS_CODE` — any string of your choosing; required for `/app` to be reachable
  at all (see below).

Then run the first migration and start the dev server:

```bash
npm run db:migrate
npm run dev
```

Open http://localhost:3000 — the landing page. No database is required just to view it (the
waitlist form will error without one, gracefully).

### The pre-launch app is gated

`/app` (and everything under it) redirects to `/` unless your browser holds a cookie
matching `PREVIEW_ACCESS_CODE`. Unlock it by visiting:

```
http://localhost:3000/preview?code=<your PREVIEW_ACCESS_CODE>
```

This sets an HttpOnly cookie and redirects you into `/app`. It's a staging/obscurity gate,
not real authorization (see `src/proxy.ts`, `src/app/preview/route.ts`) — it doesn't replace
or interact with wallet-based session auth.

The Explore page inside `/app` renders from clearly-labelled illustrative fixture data
(`src/lib/fixtures/communities.ts`); wallet connection and Sign-In with Ethereum are real,
implemented against the database (see `src/server/auth/`).

### Database (Prisma)

```bash
npm run db:generate       # regenerate the Prisma client (also runs automatically on install)
npm run db:migrate        # create/apply a dev migration from prisma/schema.prisma
npm run db:studio         # browse the database in Prisma Studio
```

### Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # eslint .
npm test             # vitest run
npm run build        # production build (next build)
npm run format       # prettier --write .
npm run format:check # prettier --check .
```

## Project layout

```
prisma/schema.prisma        Data model (see docs/architecture.md)
src/proxy.ts                Gates /app behind the preview cookie (Next.js "proxy"/middleware)
src/app/page.tsx             Public landing page ("coming soon" + waitlist)
src/app/coming-soon.css      Landing-page-only styles, scoped under .coming-soon-page
src/app/preview/route.ts     Unlocks /app for this browser
src/app/(gated)/             App shell (Header, wallet providers) + the Explore app at /app
src/app/api/                 Route handlers: auth (SIWE) and waitlist
src/components/              Reusable UI (layout, brand, wallet, explore, ui)
src/lib/                     Pure domain logic + fixtures + validation (unit-tested)
src/server/                  Server-only code: env validation, Prisma client, auth
docs/                        Product, architecture, security, build-progress docs
public/brand/                Brand assets (3D marks used by the landing page and the app)
```
