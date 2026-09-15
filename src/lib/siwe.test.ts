import { describe, expect, it } from "vitest";

import { buildSiweMessage } from "@/lib/siwe";

const baseFields = {
  domain: "gatehouse.example",
  address: "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
  uri: "https://gatehouse.example",
  chainId: 11155111,
  nonce: "abc123",
  issuedAt: new Date("2026-01-01T00:00:00.000Z"),
  expiresAt: new Date("2026-01-01T00:10:00.000Z"),
};

describe("buildSiweMessage", () => {
  it("produces a deterministic EIP-4361 message", () => {
    expect(buildSiweMessage(baseFields)).toBe(
      [
        "gatehouse.example wants you to sign in with your Ethereum account:",
        "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed",
        "",
        "Sign in to Gatehouse. This request will not trigger a blockchain transaction or cost any gas fees.",
        "",
        "URI: https://gatehouse.example",
        "Version: 1",
        "Chain ID: 11155111",
        "Nonce: abc123",
        "Issued At: 2026-01-01T00:00:00.000Z",
        "Expiration Time: 2026-01-01T00:10:00.000Z",
      ].join("\n"),
    );
  });

  it("produces the exact same string for the same inputs (needed to re-verify a signature)", () => {
    expect(buildSiweMessage(baseFields)).toBe(buildSiweMessage({ ...baseFields }));
  });

  it("changes when any field changes", () => {
    const changed = buildSiweMessage({ ...baseFields, nonce: "different" });
    expect(changed).not.toBe(buildSiweMessage(baseFields));
  });
});
