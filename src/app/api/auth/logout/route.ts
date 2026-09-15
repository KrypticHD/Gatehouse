import { NextResponse } from "next/server";

import { destroySession } from "@/server/auth/current-session";

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
