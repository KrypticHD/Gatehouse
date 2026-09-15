import { recoverMessageAddress } from "viem";

import { normalizeAddress } from "@/lib/address";
import { buildSiweMessage } from "@/lib/siwe";
import { prisma } from "@/server/db/client";

export type VerifySiweResult =
  | { ok: true; userId: string; walletId: string; chainId: number }
  | {
      ok: false;
      reason: "nonce_not_found" | "nonce_expired" | "nonce_already_used" | "signature_mismatch";
    };

/**
 * Verifies a signature against a previously issued, still-unused, unexpired nonce.
 *
 * The message is always rebuilt from the stored `AuthenticationNonce` row — the client's
 * signature is checked against *our* record of what should have been signed, never against
 * a message string the client supplies. This is what stops a client from claiming a
 * different domain/chain/expiry than what the server actually issued.
 *
 * On success, creates the User/Wallet on first sign-in (idempotent on the normalized
 * address) and marks the nonce consumed in the same transaction, so it can never be reused.
 */
export async function verifySiweSignature(params: {
  nonce: string;
  signature: `0x${string}`;
}): Promise<VerifySiweResult> {
  const nonceRow = await prisma.authenticationNonce.findUnique({ where: { nonce: params.nonce } });

  if (!nonceRow) {
    return { ok: false, reason: "nonce_not_found" };
  }
  if (nonceRow.consumedAt) {
    return { ok: false, reason: "nonce_already_used" };
  }
  if (nonceRow.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "nonce_expired" };
  }

  const message = buildSiweMessage({
    domain: nonceRow.domain,
    address: nonceRow.walletAddress,
    uri: nonceRow.uri,
    chainId: nonceRow.chainId,
    nonce: nonceRow.nonce,
    issuedAt: nonceRow.issuedAt,
    expiresAt: nonceRow.expiresAt,
  });

  let recoveredAddress: string;
  try {
    recoveredAddress = await recoverMessageAddress({ message, signature: params.signature });
  } catch {
    return { ok: false, reason: "signature_mismatch" };
  }

  if (normalizeAddress(recoveredAddress) !== nonceRow.walletAddress) {
    return { ok: false, reason: "signature_mismatch" };
  }

  const { userId, walletId } = await prisma.$transaction(async (tx) => {
    await tx.authenticationNonce.update({
      where: { id: nonceRow.id },
      data: { consumedAt: new Date() },
    });

    const existingWallet = await tx.wallet.findUnique({ where: { address: nonceRow.walletAddress } });
    if (existingWallet) {
      await tx.wallet.update({ where: { id: existingWallet.id }, data: { lastSeenAt: new Date() } });
      return { userId: existingWallet.userId, walletId: existingWallet.id };
    }

    const user = await tx.user.create({ data: {} });
    const wallet = await tx.wallet.create({
      data: { userId: user.id, address: nonceRow.walletAddress, lastSeenAt: new Date() },
    });
    return { userId: user.id, walletId: wallet.id };
  });

  return { ok: true, userId, walletId, chainId: nonceRow.chainId };
}
