import { z } from "zod";

import { isValidAddress } from "@/lib/address";
import { SUPPORTED_CHAINS } from "@/lib/validation/community-draft";

export const nonceRequestSchema = z.object({
  address: z.string().refine(isValidAddress, { message: "Must be a valid EVM address" }),
  chainId: z
    .number()
    .int()
    .refine((value) => SUPPORTED_CHAINS.some((chain) => chain.chainId === value), {
      message: "Unsupported network",
    }),
});

export const verifyRequestSchema = z.object({
  nonce: z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/, "Must be a hex signature"),
});
