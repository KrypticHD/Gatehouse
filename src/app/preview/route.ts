import { NextResponse } from "next/server";

const PREVIEW_COOKIE = "gatehouse_preview";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Unlocks the pre-launch app for this browser: GET /preview?code=<PREVIEW_ACCESS_CODE> sets
 * an HttpOnly cookie that src/middleware.ts checks for every /app request, then redirects
 * into the app. A wrong or missing code — or no PREVIEW_ACCESS_CODE configured at all —
 * bounces back to the public landing page rather than granting access.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const suppliedCode = url.searchParams.get("code");
  const expectedCode = process.env.PREVIEW_ACCESS_CODE;

  if (!expectedCode || !suppliedCode || suppliedCode !== expectedCode) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.redirect(new URL("/app", request.url));
  response.cookies.set(PREVIEW_COOKIE, expectedCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
