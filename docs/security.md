# Gatehouse — Security

This document tracks how each security principle from the product brief is (or will be)
enforced, and exactly which pieces exist today vs. remain for the wallet-auth phase.

## Principles and enforcement points

| Principle | Status | Enforcement point |
| --- | --- | --- |
| Never request or store seed phrases or private keys | Holds by construction | Wallet connection only ever uses the browser wallet's own `eth_requestAccounts`/`personal_sign` prompts (wagmi's injected connector); no key material ever reaches the server |
| Never treat a client-supplied wallet address as authenticated identity | **Enforced** | `POST /api/auth/verify` never reads an address from the request body — it recovers the address from the signature via viem's `recoverMessageAddress` and compares it to the address the nonce was issued for (`src/server/auth/verify-signature.ts`) |
| Cryptographically secure, one-use auth nonces | **Enforced** | `src/server/auth/nonce.ts` generates with `crypto.randomBytes(16)`, never `Math.random()`; `consumedAt` is set in the same transaction that creates the `Session`, so a row can't be reused — verified with a real replay attempt (second `verify` call on a used nonce → `409 nonce_already_used`) |
| Prevent signed-message replay | **Enforced, verified** | Same transaction as above; end-to-end tested (see docs/build-progress.md) |
| Validate domain, URI, chain, nonce, expiry | **Partially enforced** | The signed message is always rebuilt server-side from the stored `AuthenticationNonce` row (domain/uri/chainId/nonce/expiry), so a client can never alter what it claims to have signed. `expiresAt` is checked before accepting a signature. **Not yet done:** cross-checking the request's actual `Host` header against the stored `domain` — today `domain`/`uri` come only from `NEXT_PUBLIC_APP_URL`, so a misconfigured env var wouldn't be caught automatically |
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
bare stateless JWT. **Implemented and verified end-to-end** (see docs/build-progress.md):

- The cookie (via `iron-session`, `src/server/auth/session.ts`) holds only an encrypted
  session ID.
- The `Session` table is the source of truth: `expiresAt`, `revokedAt`, `userId`, `walletId`,
  and the `chainId` the SIWE message was signed for.
- Every protected request looks up the `Session` row server-side
  (`src/server/auth/current-session.ts`). Revoking a session (`POST /api/auth/logout`) sets
  `revokedAt` immediately — it does not wait for the cookie to expire client-side.

**Not yet implemented:** anything actually gating access on the session (holder-only
content, admin routes) — today a valid session only proves identity, nothing yet checks it.

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
