import { describe, expect, it } from "vitest";

import { communityDraftSchema, RESERVED_COMMUNITY_SLUGS } from "@/lib/validation/community-draft";

const validDraft = {
  name: "Moon Pigeon",
  ticker: "coo",
  slug: "moon-pigeon",
  description: "A flock of holders exploring the stars together.",
  chainId: 11155111,
  tokenContractAddress: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  tokenDecimals: 18,
  minimumTokenBalance: "1000",
};

describe("communityDraftSchema", () => {
  it("accepts a valid draft and normalizes ticker casing", () => {
    const result = communityDraftSchema.parse(validDraft);
    expect(result.ticker).toBe("COO");
  });

  it.each(RESERVED_COMMUNITY_SLUGS)("rejects the reserved slug %s", (slug) => {
    const result = communityDraftSchema.safeParse({ ...validDraft, slug });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid token contract address", () => {
    const result = communityDraftSchema.safeParse({
      ...validDraft,
      tokenContractAddress: "not-an-address",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported chain id", () => {
    const result = communityDraftSchema.safeParse({ ...validDraft, chainId: 999999 });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with uppercase or invalid characters after normalization fails", () => {
    const result = communityDraftSchema.safeParse({ ...validDraft, slug: "Moon Pigeon!" });
    expect(result.success).toBe(false);
  });
});
