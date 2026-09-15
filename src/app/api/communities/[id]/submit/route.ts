import { NextResponse } from "next/server";

import { getCurrentSession } from "@/server/auth/current-session";
import { submitCommunityForVerification } from "@/server/communities/submit-for-verification";

const STATUS_BY_REASON: Record<string, number> = {
  not_found: 404,
  forbidden: 403,
  invalid_state: 409,
};

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const result = await submitCommunityForVerification({ communityId: id, actorUserId: session.userId });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: STATUS_BY_REASON[result.reason] ?? 400 });
  }

  return NextResponse.json({ ok: true });
}
