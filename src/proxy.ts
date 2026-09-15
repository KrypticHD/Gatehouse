import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps the pre-launch app (everything under /app) out of reach for ordinary visitors while
 * the public "coming soon" landing page is live at /. Access is a shared secret in the
 * PREVIEW_ACCESS_CODE env var, unlocked via GET /preview?code=... (src/app/preview/route.ts),
 * which sets the cookie this middleware checks. No env var configured means /app is blocked
 * outright — fail closed, not open — since an unset secret must never mean "open to everyone".
 *
 * This is obscurity/staging-gate, not real authorization — it does not replace the
 * eligibility/authorization checks a real protected route needs (see docs/security.md).
 */
const PREVIEW_COOKIE = "gatehouse_preview";

export function proxy(request: NextRequest) {
  const expectedCode = process.env.PREVIEW_ACCESS_CODE;
  if (!expectedCode) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const cookieValue = request.cookies.get(PREVIEW_COOKIE)?.value;
  if (cookieValue === expectedCode) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/app/:path*"],
};
