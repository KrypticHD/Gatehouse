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

## Requirements

- Node.js `^20.19 || ^22.12 || >=24.0` (developed against Node 24)
- npm (ships with Node)
- A PostgreSQL database (local, Docker, or a managed instance like Neon/Supabase) — only
  needed once you touch anything database-backed; the Explore page runs on fixture data
  without one

## Local development

```bash
npm install
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — required before running migrations or anything database-backed.
- Everything else in `.env.example` is reserved for the wallet-authentication phase and can
  stay blank for now; see the comments in that file.

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000. The Explore page renders from clearly-labelled illustrative
fixture data (`src/lib/fixtures/communities.ts`) — no database is required to view it.

### Database (Prisma)

Once `DATABASE_URL` points at a real Postgres instance:

```bash
npm run db:generate       # regenerate the Prisma client (also runs automatically on install)
npm run db:migrate        # create/apply a dev migration from prisma/schema.prisma
npm run db:studio         # browse the database in Prisma Studio
```

No migration has been generated yet in this repository — there was no database available to
diff against during the build. Running `npm run db:migrate` for the first time will create
`prisma/migrations/` from the current schema.

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
prisma/schema.prisma       Data model (see docs/architecture.md)
src/app/                   App Router pages (Explore page at src/app/page.tsx)
src/components/            Reusable UI (layout, brand, wallet, explore, ui)
src/lib/                   Pure domain logic + fixtures + validation (unit-tested)
src/server/                Server-only code: env validation, Prisma client
docs/                      Product, architecture, security, build-progress docs
public/brand/              Brand assets (3D marketing mark)
```

## Current status

Wallet authentication is **not** implemented yet — the "Connect wallet" button is a labelled
interface placeholder. See [`docs/build-progress.md`](docs/build-progress.md) for the full
checklist of what's real vs. planned, and the recommended next phase.
