# Gatehouse — Product

## Vision

Gatehouse gives crypto tokens useful community functions. A user connects one wallet, signs
one authentication message, and automatically discovers every registered community their
token holdings unlock.

- **Core message:** "Your token. Your people."
- **Supporting message:** "One wallet. Find your community."

Gatehouse is a **mobile-first website** — not a native app, not a Discord bot/server. There
is no email/password registration in the normal user flow; wallet connection plus a signed
message is the front door.

## User types

### Token holders

- Browse public communities without connecting a wallet.
- Connect a wallet (no payment, token approval, or custody requested).
- Sign a message proving control of that wallet.
- Automatically see every registered community they qualify for by token balance.
- Enter qualifying communities, read holder-only announcements, and participate in holder
  discussions.
- Later: voting and rewards (planned modules, not built yet).

### Project owners

- Connect and authenticate with a wallet.
- Create a draft community: name, ticker, description, artwork, network, existing ERC-20
  contract address, minimum balance.
- Create announcements and discussions, preview the draft, and submit for verification and
  activation.
- Later: fund a recurring crypto subscription (billing schema exists; no billing contract or
  charge job runs yet).

**Holding tokens or knowing a contract address does not make someone an official
representative of a project.** Verification is a separate review step — see
[docs/security.md](./security.md).

## Business model

Projects pay Gatehouse recurring crypto subscriptions; ordinary holders never pay to access
a qualifying community. The intended model is prepaid native ETH: a project owner deposits
ETH into a billing contract, Gatehouse draws recurring charges from that prepaid credit, and
unused credit is always distinguishable from money Gatehouse has actually earned. **No
billing contract, deposit flow, or charge job is implemented in this phase** — only the data
model that will support it (`CommunitySubscription`, `SubscriptionDeposit`,
`SubscriptionCharge`).

## $GATE

Gatehouse will have its own ERC-20 token, $GATE, and its own Gatehouse community, used for
holder access, development updates, feature discussions, roadmap polls, feature proposals,
early feature testing, and participation privileges that scale with holdings. $GATE **does
not** represent company ownership or an automatic claim on platform revenue.

**Explicitly unresolved in this phase:** production supply, allocation, vesting, liquidity,
and the $GATE contract address. Nothing here deploys a token, runs a sale, or moves real
funds.

## Planned community modules

Built so each can land independently:

1. Token-gated access — **implemented as a schema + pure eligibility-decision function this
   phase; not yet wired to a live wallet session or on-chain balance read.**
2. Private announcements — **UI components exist; no posting/authoring flow yet.**
3. Community discussions — **UI components exist; no posting/authoring flow yet.**
4. Advisory holder voting using blockchain snapshots — **planned, not started.**
5. Community rewards funded separately per project — **planned, not started.**
6. Participation levels based on token holdings — **planned, not started.**
7. Recurring crypto subscriptions paid by project owners — **schema only, see Business
   model above.**

The first working release (next phase) targets: wallet authentication, community discovery,
token-gated access, announcements, and discussions. Voting and rewards stay planned modules
until they're real — this phase does not fake them.

## Visual identity

- **Colours:** Midnight Navy `#141A35`, Electric Blue `#476CFF`, Soft Lilac `#B5A1ED`, Warm
  Coral `#FF8A78`, Cream `#F7F2E9`.
- **Mark:** a large, rounded, flowing capital "G" with a sculpted blue-to-lilac finish. The
  full 3D artwork (`public/brand/gatehouse-mark-3d.png`, sourced from
  `GATEHOUSE/Logo/ChatGPT Image Sep 15, 2026, 05_14_10 PM.png`) is reserved for marketing
  surfaces. The interface uses a flat gradient version
  (`src/components/brand/GatehouseMark.tsx`) for clarity and performance.
- **Tone:** colourful crypto-community world, welcoming and energetic, dark navy
  foundations, blue/lilac highlights, coral reserved for important actions (Connect wallet,
  Create community), cream typography. Crypto-native, not casino/exchange/bank styling.
- **Avoid:** electric lime, copper/marble, luxury members'-club styling, the previous
  inverted-U gateway mascot, horseshoe/generic property-company logos, dense effects behind
  text, fake activity/member counts/returns/testimonials.

Every sample community shown in this phase is explicitly labelled "illustrative development
data" in the UI (`src/lib/fixtures/communities.ts`, rendered on the Explore page) — see
[docs/build-progress.md](./build-progress.md) for what's real vs. illustrative.
