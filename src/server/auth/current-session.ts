import { prisma } from "@/server/db/client";
import { getSessionCookie } from "@/server/auth/session";

export interface CurrentSession {
  userId: string;
  address: string;
  chainId: number;
}

/**
 * Re-checks the `Session` row on every call rather than trusting the cookie's mere presence
 * — a revoked or expired session must stop working immediately. See docs/security.md.
 */
export async function getCurrentSession(): Promise<CurrentSession | null> {
  const cookie = await getSessionCookie();
  if (!cookie.sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: cookie.sessionId },
    include: { wallet: true },
  });

  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return { userId: session.userId, address: session.wallet.address, chainId: session.chainId };
}

export async function destroySession(): Promise<void> {
  const cookie = await getSessionCookie();
  if (cookie.sessionId) {
    await prisma.session
      .update({ where: { id: cookie.sessionId }, data: { revokedAt: new Date() } })
      .catch(() => undefined);
  }
  cookie.destroy();
}
