import { NextResponse } from "next/server";

import { verifyRequestSchema } from "@/lib/validation/auth";
import { recordAuditEvent } from "@/server/audit";
import { createSession } from "@/server/auth/create-session";
import { verifySiweSignature } from "@/server/auth/verify-signature";

const VERIFY_FAILURE_STATUS: Record<string, number> = {
  nonce_not_found: 400,
  nonce_expired: 400,
  nonce_already_used: 409,
  signature_mismatch: 401,
};

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = verifyRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await verifySiweSignature({
    nonce: parsed.data.nonce,
    signature: parsed.data.signature as `0x${string}`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: VERIFY_FAILURE_STATUS[result.reason] ?? 400 });
  }

  const requestIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  await createSession({
    userId: result.userId,
    walletId: result.walletId,
    chainId: result.chainId,
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipAddress: requestIp,
  });

  await recordAuditEvent({
    actorUserId: result.userId,
    action: "session.created",
    metadata: { chainId: result.chainId },
    ipAddress: requestIp,
  });

  return NextResponse.json({ ok: true });
}
