import { describe, expect, it } from "vitest";

import { evaluateAccessRule, evaluateCommunityEligibility } from "@/lib/eligibility";

describe("evaluateAccessRule", () => {
  it("is eligible when the balance meets the minimum", () => {
    const result = evaluateAccessRule({ ok: true, balance: 100n }, 100n);
    expect(result).toEqual({ status: "eligible", balance: 100n, requiredMinimum: 100n });
  });

  it("is ineligible when the balance is below the minimum", () => {
    const result = evaluateAccessRule({ ok: true, balance: 99n }, 100n);
    expect(result).toEqual({ status: "ineligible", balance: 99n, requiredMinimum: 100n });
  });

  it("reports a provider error distinctly from an insufficient balance", () => {
    const result = evaluateAccessRule({ ok: false, reason: "RPC timeout" }, 100n);
    expect(result).toEqual({ status: "provider_error", reason: "RPC timeout" });
  });
});

describe("evaluateCommunityEligibility", () => {
  it("is eligible if any rule is eligible", () => {
    const status = evaluateCommunityEligibility([
      { status: "ineligible", balance: 0n, requiredMinimum: 10n },
      { status: "eligible", balance: 10n, requiredMinimum: 10n },
    ]);
    expect(status).toBe("eligible");
  });

  it("is a provider error only when every rule failed to resolve", () => {
    const status = evaluateCommunityEligibility([
      { status: "provider_error", reason: "RPC timeout" },
      { status: "provider_error", reason: "RPC timeout" },
    ]);
    expect(status).toBe("provider_error");
  });

  it("is ineligible when at least one rule resolved but none were met", () => {
    const status = evaluateCommunityEligibility([
      { status: "provider_error", reason: "RPC timeout" },
      { status: "ineligible", balance: 0n, requiredMinimum: 10n },
    ]);
    expect(status).toBe("ineligible");
  });

  it("is ineligible when there are no rules", () => {
    expect(evaluateCommunityEligibility([])).toBe("ineligible");
  });
});
