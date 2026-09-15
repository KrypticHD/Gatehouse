import { NextResponse } from "next/server";

import { getCurrentSession } from "@/server/auth/current-session";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, address: session.address, chainId: session.chainId });
}
