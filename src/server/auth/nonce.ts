import { randomBytes } from "node:crypto";

import { prisma } from "@/server/db/client";
import { env } from "@/server/env";
import { buildSiweMessage } from "@/lib/siwe";

const NONCE_TTL_MINUTES = 10;

function appOrigin(): URL {
  return new URL(env.NEXT_PUBLIC_APP_URL);
}

export interface IssuedNonce {
  nonce: string;
  message: string;
  expiresAt: Date;
}

/**
 * Creates a cryptographically random, one-use nonce tied to a specific address, domain and
 * chain, and returns the exact SIWE message the wallet should sign. `consumedAt` starts null
 * and is set the instant verify-signature.ts accepts a signature over this nonce, so the same
 * signed message can never be replayed.
 */
export async function issueNonce(params: {
  walletAddress: string;
  chainId: number;
  requestIp?: string;
}): Promise<IssuedNonce> {
  const nonce = randomBytes(16).toString("hex");
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + NONCE_TTL_MINUTES * 60_000);
  const origin = appOrigin();

  await prisma.authenticationNonce.create({
    data: {
      nonce,
      walletAddress: params.walletAddress,
      domain: origin.host,
      uri: origin.origin,
      chainId: params.chainId,
      issuedAt,
      expiresAt,
      requestIp: params.requestIp,
    },
  });

  const message = buildSiweMessage({
    domain: origin.host,
    address: params.walletAddress,
    uri: origin.origin,
    chainId: params.chainId,
    nonce,
    issuedAt,
    expiresAt,
  });

  return { nonce, message, expiresAt };
}
