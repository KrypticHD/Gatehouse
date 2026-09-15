import { recordAuditEvent } from "@/server/audit";
import { prisma } from "@/server/db/client";

export type SubmitForVerificationResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "forbidden" | "invalid_state" };

/**
 * Moves a draft into review: DRAFT -> IN_REVIEW, verification UNVERIFIED -> PENDING. Never
 * touches publicationStatus — verification and publication are independent axes (see
 * docs/architecture.md), and this endpoint only ever asks a (future) reviewer to look at it.
 */
export async function submitCommunityForVerification(params: {
  communityId: string;
  actorUserId: string;
}): Promise<SubmitForVerificationResult> {
  const community = await prisma.community.findUnique({
    where: { id: params.communityId },
    include: { administrators: true },
  });

  if (!community) {
    return { ok: false, reason: "not_found" };
  }

  // Scoped to this specific community's administrators — being an admin elsewhere never counts.
  const isAdmin = community.administrators.some((admin) => admin.userId === params.actorUserId);
  if (!isAdmin) {
    return { ok: false, reason: "forbidden" };
  }

  if (community.lifecycleStatus !== "DRAFT") {
    return { ok: false, reason: "invalid_state" };
  }

  await prisma.$transaction([
    prisma.community.update({
      where: { id: community.id },
      data: { lifecycleStatus: "IN_REVIEW", verificationStatus: "PENDING" },
    }),
    prisma.communityVerification.update({
      where: { communityId: community.id },
      data: { status: "PENDING", submittedAt: new Date() },
    }),
  ]);

  await recordAuditEvent({
    actorUserId: params.actorUserId,
    communityId: community.id,
    action: "community.submitted_for_verification",
  });

  return { ok: true };
}
