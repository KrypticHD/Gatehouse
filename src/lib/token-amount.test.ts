import { describe, expect, it } from "vitest";

import { formatTokenAmount, InvalidTokenAmountError, toRawTokenAmount } from "@/lib/token-amount";

describe("toRawTokenAmount", () => {
  it("converts a whole number", () => {
    expect(toRawTokenAmount("1000", 18)).toBe(1000n * 10n ** 18n);
  });

  it("converts a fractional amount exactly, with no floating-point drift", () => {
    expect(toRawTokenAmount("0.1", 18)).toBe(100000000000000000n);
  });

  it("handles zero decimals", () => {
    expect(toRawTokenAmount("42", 0)).toBe(42n);
  });

  it("handles a zero amount", () => {
    expect(toRawTokenAmount("0", 18)).toBe(0n);
  });

  it("rejects more fractional digits than the token supports", () => {
    expect(() => toRawTokenAmount("1.23", 1)).toThrow(InvalidTokenAmountError);
  });

  it("rejects a negative amount", () => {
    expect(() => toRawTokenAmount("-1", 18)).toThrow(InvalidTokenAmountError);
  });

  it("rejects a non-numeric string", () => {
    expect(() => toRawTokenAmount("abc", 18)).toThrow(InvalidTokenAmountError);
  });
});

describe("formatTokenAmount", () => {
  it("formats a whole number amount", () => {
    expect(formatTokenAmount(1000n * 10n ** 18n, 18)).toBe("1000");
  });

  it("formats and trims a fractional amount", () => {
    expect(formatTokenAmount(100000000000000000n, 18)).toBe("0.1");
  });

  it("round-trips through toRawTokenAmount", () => {
    const raw = toRawTokenAmount("1234.5678", 18);
    expect(formatTokenAmount(raw, 18)).toBe("1234.5678");
  });

  it("formats zero decimals with no fractional part", () => {
    expect(formatTokenAmount(42n, 0)).toBe("42");
  });
});
