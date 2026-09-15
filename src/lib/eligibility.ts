/**
 * Pure decision logic for token-gated access. The actual on-chain balance read (via viem,
 * once wallet authentication ships) lives outside this module — this file only decides what
 * a balance (or a failure to read one) means, so the rule can be unit-tested without a live
 * RPC provider and so a provider outage is never silently reported as "not a holder".
 */

export type BalanceLookupResult =
  | { ok: true; balance: bigint }
  | { ok: false; reason: string };

export type EligibilityResult =
  | { status: "eligible"; balance: bigint; requiredMinimum: bigint }
  | { status: "ineligible"; balance: bigint; requiredMinimum: bigint }
  | { status: "provider_error"; reason: string };

export function evaluateAccessRule(
  lookup: BalanceLookupResult,
  requiredMinimum: bigint,
): EligibilityResult {
  if (!lookup.ok) {
    return { status: "provider_error", reason: lookup.reason };
  }

  if (lookup.balance >= requiredMinimum) {
    return { status: "eligible", balance: lookup.balance, requiredMinimum };
  }

  return { status: "ineligible", balance: lookup.balance, requiredMinimum };
}

/** A holder qualifies for a community if at least one of its access rules is met. */
export function evaluateCommunityEligibility(
  ruleResults: EligibilityResult[],
): "eligible" | "ineligible" | "provider_error" {
  if (ruleResults.length === 0) {
    return "ineligible";
  }
  if (ruleResults.some((result) => result.status === "eligible")) {
    return "eligible";
  }
  if (ruleResults.every((result) => result.status === "provider_error")) {
    return "provider_error";
  }
  return "ineligible";
}
