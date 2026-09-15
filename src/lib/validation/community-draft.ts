import { z } from "zod";

import { isValidAddress } from "@/lib/address";

/**
 * The reserved Gatehouse platform community's slug. No project owner may claim this slug or
 * flag their community as the platform community — see docs/security.md.
 */
export const RESERVED_COMMUNITY_SLUGS = ["gatehouse", "admin", "api", "platform"] as const;

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Networks Gatehouse can gate access on in this phase. Production chain selection is
 * intentionally still open — see docs/architecture.md. */
export const SUPPORTED_CHAINS = [
  { chainId: 11155111, name: "Sepolia", isTestnet: true },
  { chainId: 1, name: "Ethereum", isTestnet: false },
] as const;

export const communityDraftSchema = z.object({
  name: z.string().trim().min(2).max(64),
  ticker: z
    .string()
    .trim()
    .min(1)
    .max(12)
    .transform((value) => value.toUpperCase()),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(48)
    .regex(SLUG_PATTERN, "Slug may only contain lowercase letters, numbers and hyphens")
    .refine((value) => !RESERVED_COMMUNITY_SLUGS.includes(value as (typeof RESERVED_COMMUNITY_SLUGS)[number]), {
      message: "This slug is reserved",
    }),
  description: z.string().trim().min(1).max(2000),
  artworkUrl: z.string().url().optional(),
  chainId: z.number().int().refine(
    (value) => SUPPORTED_CHAINS.some((chain) => chain.chainId === value),
    { message: "Unsupported network" },
  ),
  tokenContractAddress: z.string().refine(isValidAddress, {
    message: "Must be a valid ERC-20 contract address",
  }),
  tokenDecimals: z.number().int().min(0).max(36),
  minimumTokenBalance: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, "Must be a non-negative number"),
});

export type CommunityDraftInput = z.input<typeof communityDraftSchema>;
export type CommunityDraft = z.output<typeof communityDraftSchema>;
