import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";

/**
 * Append-only security/admin event log (see AuditEvent in prisma/schema.prisma). Failures to
 * write an audit row are logged but never block the action being audited.
 */
export async function recordAuditEvent(params: {
  actorUserId?: string;
  communityId?: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: {
        actorUserId: params.actorUserId,
        communityId: params.communityId,
        action: params.action,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to record audit event", params.action, error);
  }
}
