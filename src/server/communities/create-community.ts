import { normalizeAddress } from "@/lib/address";
import { toRawTokenAmount } from "@/lib/token-amount";
import type { CommunityDraft } from "@/lib/validation/community-draft";
import { recordAuditEvent } from "@/server/audit";
import { prisma } from "@/server/db/client";
import { Prisma } from "@/generated/prisma/client";

export type CreateCommunityResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; reason: "slug_taken" };

/**
 * Creates a community as a draft: unverified, unpublished, and gated by exactly the token
 * the owner supplied — a community always has a linked token, never a placeholder one. Runs
 * as a single transaction so the community, its access rule, its verification row, and the
 * creator's admin membership either all exist or none do.
 */
export async function createCommunityDraft(params: {
  ownerUserId: string;
  draft: CommunityDraft;
}): Promise<CreateCommunityResult> {
  const { draft } = params;
  const rawMinimumBalance = toRawTokenAmount(draft.minimumTokenBalance, draft.tokenDecimals);

  try {
    const community = await prisma.$transaction(async (tx) => {
      const created = await tx.community.create({
        data: {
          slug: draft.slug,
          name: draft.name,
          ticker: draft.ticker,
          description: draft.description,
          artworkUrl: draft.artworkUrl,
          accessRules: {
            create: {
              chainId: draft.chainId,
              tokenContractAddress: normalizeAddress(draft.tokenContractAddress),
              tokenDecimals: draft.tokenDecimals,
              minimumTokenBalance: rawMinimumBalance.toString(),
            },
          },
          verification: {
            create: {},
          },
          administrators: {
            create: {
              userId: params.ownerUserId,
              role: "OWNER",
            },
          },
        },
      });

      return created;
    });

    await recordAuditEvent({
      actorUserId: params.ownerUserId,
      communityId: community.id,
      action: "community.created",
      metadata: { slug: community.slug },
    });

    return { ok: true, id: community.id, slug: community.slug };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, reason: "slug_taken" };
    }
    throw error;
  }
}
