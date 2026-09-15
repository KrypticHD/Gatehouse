import { NextResponse } from "next/server";

import { normalizeAddress } from "@/lib/address";
import { nonceRequestSchema } from "@/lib/validation/auth";
import { issueNonce } from "@/server/auth/nonce";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = nonceRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const requestIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  const { nonce, message, expiresAt } = await issueNonce({
    walletAddress: normalizeAddress(parsed.data.address),
    chainId: parsed.data.chainId,
    requestIp,
  });

  return NextResponse.json({ nonce, message, expiresAt });
}
