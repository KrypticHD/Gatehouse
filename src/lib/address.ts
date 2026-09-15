const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

/**
 * True for any syntactically valid EVM address (0x + 40 hex chars). Does not check EIP-55
 * checksum casing — callers that receive an address from a wallet should trust the wallet's
 * casing for display but always compare/store the normalized form from {@link normalizeAddress}.
 */
export function isValidAddress(value: string): boolean {
  return ADDRESS_PATTERN.test(value);
}

/**
 * Canonical, storage/comparison form of an EVM address: lowercase hex. Gatehouse never
 * treats a client-supplied address as authenticated identity by itself — this only
 * normalizes the string so the same address always maps to the same database row.
 */
export function normalizeAddress(value: string): string {
  if (!isValidAddress(value)) {
    throw new Error(`"${value}" is not a valid EVM address`);
  }
  return value.toLowerCase();
}

/** Display-only shortened form, e.g. "0x1234…abcd". Never used for storage/comparison. */
export function truncateAddress(value: string): string {
  if (!isValidAddress(value)) {
    throw new Error(`"${value}" is not a valid EVM address`);
  }
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
