import { describe, expect, it } from "vitest";

import { isValidAddress, normalizeAddress, truncateAddress } from "@/lib/address";

describe("isValidAddress", () => {
  it("accepts a well-formed address", () => {
    expect(isValidAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")).toBe(true);
  });

  it("rejects a short address", () => {
    expect(isValidAddress("0x1234")).toBe(false);
  });

  it("rejects an address missing the 0x prefix", () => {
    expect(isValidAddress("52908400098527886E0F7030069857D2E4169EE")).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(isValidAddress(`0x${"g".repeat(40)}`)).toBe(false);
  });
});

describe("normalizeAddress", () => {
  it("lowercases a valid address", () => {
    expect(normalizeAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")).toBe(
      "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
    );
  });

  it("throws on an invalid address", () => {
    expect(() => normalizeAddress("not-an-address")).toThrow();
  });
});

describe("truncateAddress", () => {
  it("shortens a valid address", () => {
    expect(truncateAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")).toBe("0x5aAe…eAed");
  });

  it("throws on an invalid address", () => {
    expect(() => truncateAddress("not-an-address")).toThrow();
  });
});
