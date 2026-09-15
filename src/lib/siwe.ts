/**
 * Minimal Sign-In with Ethereum (EIP-4361) message construction.
 *
 * Deliberately hand-rolled instead of depending on the `siwe` npm package, which hard-depends
 * on `ethers` as a peer for its `.verify()` method — an unused second web3 library alongside
 * wagmi/viem for no benefit (see docs/architecture.md). We only ever need to construct this
 * exact string; verification (src/server/auth/verify-signature.ts) recovers the signing
 * address with viem and never trusts a client-supplied message string — the server always
 * rebuilds the message itself from the stored nonce row, so these two fields can never drift.
 */

export interface SiweMessageFields {
  domain: string;
  address: string;
  uri: string;
  chainId: number;
  nonce: string;
  issuedAt: Date;
  expiresAt: Date;
  statement?: string;
}

const DEFAULT_STATEMENT =
  "Sign in to Gatehouse. This request will not trigger a blockchain transaction or cost any gas fees.";

export function buildSiweMessage({
  domain,
  address,
  uri,
  chainId,
  nonce,
  issuedAt,
  expiresAt,
  statement = DEFAULT_STATEMENT,
}: SiweMessageFields): string {
  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    "",
    statement,
    "",
    `URI: ${uri}`,
    "Version: 1",
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt.toISOString()}`,
    `Expiration Time: ${expiresAt.toISOString()}`,
  ].join("\n");
}
