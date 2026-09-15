import { NextResponse } from "next/server";

import { communityDraftSchema } from "@/lib/validation/community-draft";
import { getCurrentSession } from "@/server/auth/current-session";
import { createCommunityDraft } from "@/server/communities/create-community";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = communityDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await createCommunityDraft({ ownerUserId: session.userId, draft: parsed.data });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 409 });
  }

  return NextResponse.json({ id: result.id, slug: result.slug }, { status: 201 });
}
