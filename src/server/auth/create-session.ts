import { prisma } from "@/server/db/client";
import { getSessionCookie } from "@/server/auth/session";

const SESSION_TTL_DAYS = 30;

export async function createSession(params: {
  userId: string;
  walletId: string;
  chainId: number;
  userAgent?: string;
  ipAddress?: string;
}) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId: params.userId,
      walletId: params.walletId,
      chainId: params.chainId,
      expiresAt,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    },
  });

  const cookie = await getSessionCookie();
  cookie.sessionId = session.id;
  await cookie.save();

  return session;
}
