# Gatehouse — Security

This document tracks how each security principle from the product brief is (or will be)
enforced, and exactly which pieces exist today vs. remain for the wallet-auth phase.

## Principles and enforcement points

| Principle | Status | Enforcement point |
| --- | --- | --- |
| Never request or store seed phrases or private keys | Holds by construction | Wallet connection will only ever use a browser wallet's `eth_requestAccounts`/signing prompts (RainbowKit/wagmi); no key material ever reaches the server |
| Never treat a client-supplied wallet address as authenticated identity | Not yet applicable (no auth flow exists) | Future: identity is only ever established by verifying a SIWE signature server-side against a nonce issued by the server, never by trusting an address in a request body/header |
| Cryptographically secure, one-use auth nonces | Schema ready | `AuthenticationNonce.nonce` is `@unique`; `consumedAt` is set the instant a signature is verified so the row can't be reused. The nonce value itself must be generated with `crypto.randomUUID()` or `crypto.randomBytes`, never `Math.random()`, when the issuing route is built |
| Prevent signed-message replay | Schema ready | Verification will require: nonce exists, `consumedAt IS NULL`, `expiresAt > now()`, then set `consumedAt` in the same transaction that creates the `Session` |
| Validate domain, URI, chain, nonce, expiry | Not yet implemented | `AuthenticationNonce.domain`/`chainId` are stored at issuance time and must be compared against the SIWE message fields (not just the signature) before accepting it |
| Keep authentication separate from community authorization | Enforced by schema shape | `Session`/`Wallet`/`User` (identity) are entirely separate models from `CommunityAdministrator` (authorization) and `CommunityAccessRule` (eligibility) — proving who you are never implies what you can access |
| Enforce access on the server for every protected request | N/A this phase — no protected routes exist yet | When routes are added: every admin route must re-check `CommunityAdministrator` for the specific `communityId` server-side; every holder-only read must re-run `evaluateCommunityEligibility` server-side. Hiding a button is never sufficient |
| Never rely on hidden interface elements as access control | Followed | The Explore page fixtures render the same data to every visitor; nothing today is hidden-but-fetchable. This must hold for real holder-only content too — a holders-only announcement's body must not be present in the initial HTML/JSON sent to an ineligible visitor |
| Prevent one community owner from accessing another's private administration | Schema ready | `CommunityAdministrator` is unique on `(communityId, userId)`; every future admin route must scope its authorization check to the `communityId` in the URL, not just "is this user an admin of *some* community" |
| Identify tokens by chain ID and contract address, never ticker alone | Enforced in schema + validation | `CommunityAccessRule.(chainId, tokenContractAddress)`; `communityDraftSchema` validates the address shape and a supported `chainId` together |
| Store token amounts as exact integers, never floating-point | Enforced | `Decimal @db.Decimal(78, 0)` columns; `src/lib/token-amount.ts` converts using string/`BigInt` math only, unit-tested for whole numbers, fractional amounts, and rejection of over-precise input |
| Distinguish blockchain-provider failures from insufficient balances | Enforced in logic | `src/lib/eligibility.ts`'s `evaluateAccessRule` takes a `BalanceLookupResult` that is either `{ ok: true, balance }` or `{ ok: false, reason }` and returns a distinct `provider_error` status — a future outage can never be reported to a user as "you don't hold enough" |
| Never expose private content in public page data, metadata or caches | N/A this phase — no private content exists yet | When announcements/discussions ship: holders-only content must be fetched in a server component/route that checks eligibility before the data leaves the server, and must not be included in any statically-cached or public API response |
| Do not label projects as verified automatically | Enforced | `CommunityVerification.status` defaults to `UNVERIFIED` and only a reviewer action (future admin-only route, logged via `AuditEvent`) can move it to `VERIFIED`. Nothing in community creation sets this |
| Do not invent production token addresses, treasury addresses or economics | Followed | No production contract addresses appear anywhere in this repo; fixture data uses no addresses at all (see `src/lib/fixtures/communities.ts`) |

## Session model

Gatehouse uses **server-side sessions referenced by an encrypted HttpOnly cookie**, not a
bare stateless JWT:

- The cookie (via `iron-session`, once wired up) will hold only an encrypted session ID.
- The `Session` table is the source of truth: `expiresAt`, `revokedAt`, `userId`, `walletId`,
  and the `chainId` the SIWE message was signed for.
- Every protected request looks up the `Session` row server-side. Revoking a session (e.g.
  "sign out everywhere") is an immediate database update, not something that waits for a
  token to expire.

`iron-session` and the `SESSION_SECRET` env var are already dependencies/schema entries in
this phase; no route creates or reads a session cookie yet (see docs/build-progress.md).

## Known accepted risk in this phase

`npm audit` reports vulnerabilities (mostly `uuid`/`ws` advisories) nested inside
RainbowKit's WalletConnect/MetaMask SDK transitive dependencies. They are not fixable
without forcing wagmi to v3, which would break RainbowKit compatibility (see
docs/architecture.md). This is tracked, not silently ignored — re-run `npm audit
--omit=dev` after any RainbowKit/wagmi upgrade and reassess.

## Reserved platform identity

The slug `gatehouse` (and `admin`, `api`, `platform`) and the `isPlatformCommunity` flag are
rejected/refused for ordinary project owners at the validation layer
(`src/lib/validation/community-draft.ts`). This is **application-layer enforcement only** in
this phase — a direct database write could still set the flag. A future phase should add a
partial unique index or check constraint so the platform community can't be duplicated or
spoofed even by a bug elsewhere in the app.
