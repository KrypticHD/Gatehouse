/**
 * Exact, floating-point-free conversion between a human-entered token amount (e.g. what a
 * project owner types into "minimum token balance") and the integer amount in the token's
 * smallest unit that is actually compared against on-chain balances.
 *
 * Never uses `Number`/`parseFloat` — every digit is handled as a string/bigint so a value
 * like "1000.1" with 18 decimals round-trips exactly instead of picking up binary
 * floating-point error.
 */

const DECIMAL_AMOUNT_PATTERN = /^\d+(\.\d+)?$/;

export class InvalidTokenAmountError extends Error {}

/**
 * Converts a human-readable decimal string (e.g. "1000", "0.5") into the exact integer
 * amount expressed in the token's smallest unit, given its `decimals`.
 */
export function toRawTokenAmount(humanAmount: string, decimals: number): bigint {
  const trimmed = humanAmount.trim();

  if (!DECIMAL_AMOUNT_PATTERN.test(trimmed)) {
    throw new InvalidTokenAmountError(
      `"${humanAmount}" is not a non-negative decimal number`,
    );
  }
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new InvalidTokenAmountError(`decimals must be a non-negative integer, got ${decimals}`);
  }

  const [wholePart, fractionalPart = ""] = trimmed.split(".");

  if (fractionalPart.length > decimals) {
    throw new InvalidTokenAmountError(
      `"${humanAmount}" has more fractional digits than the token's ${decimals} decimals`,
    );
  }

  const paddedFractional = fractionalPart.padEnd(decimals, "0");
  const digits = `${wholePart}${paddedFractional}`.replace(/^0+(?=\d)/, "");

  return BigInt(digits);
}

/**
 * Converts an exact integer amount (as stored/compared on-chain) back into a human-readable
 * decimal string for display.
 */
export function formatTokenAmount(rawAmount: bigint, decimals: number): string {
  if (rawAmount < 0n) {
    throw new InvalidTokenAmountError("rawAmount must not be negative");
  }
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new InvalidTokenAmountError(`decimals must be a non-negative integer, got ${decimals}`);
  }

  const digits = rawAmount.toString().padStart(decimals + 1, "0");
  const wholePart = digits.slice(0, digits.length - decimals) || "0";
  const fractionalPart = decimals === 0 ? "" : digits.slice(digits.length - decimals);
  const trimmedFractional = fractionalPart.replace(/0+$/, "");

  return trimmedFractional.length > 0 ? `${wholePart}.${trimmedFractional}` : wholePart;
}
