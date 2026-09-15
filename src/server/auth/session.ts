import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";

import { env } from "@/server/env";

/**
 * The cookie only ever holds a pointer (`sessionId`) into the `Session` table — never the
 * user's identity or any claim directly. Every read re-validates against the database so a
 * revoked/expired session stops working immediately, without waiting for the cookie to
 * expire client-side. See docs/security.md "Session model".
 */
export interface SessionCookieData {
  sessionId?: string;
}

const COOKIE_NAME = "gatehouse_session";

function requireSessionSecret(): string {
  if (!env.SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET is not set. Copy .env.example to .env.local and set a 32+ character secret.",
    );
  }
  return env.SESSION_SECRET;
}

export async function getSessionCookie(): Promise<IronSession<SessionCookieData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionCookieData>(cookieStore, {
    cookieName: COOKIE_NAME,
    password: requireSessionSecret(),
    cookieOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
}
