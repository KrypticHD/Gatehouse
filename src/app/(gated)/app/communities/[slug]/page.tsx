import Link from "next/link";
import { notFound } from "next/navigation";

import { formatTokenAmount } from "@/lib/token-amount";
import { SUPPORTED_CHAINS } from "@/lib/validation/community-draft";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db/client";

import { SubmitForVerificationButton } from "./SubmitForVerificationButton";

const LIFECYCLE_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

const VERIFICATION_LABEL: Record<string, string> = {
  UNVERIFIED: "Unverified",
  PENDING: "Verification pending",
  VERIFIED: "Verified",
  REJECTED: "Verification rejected",
};

export default async function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const community = await prisma.community.findUnique({
    where: { slug },
    include: { accessRules: true, administrators: true },
  });

  if (!community) {
    notFound();
  }

  const session = await getCurrentSession();
  const isAdmin = !!session && community.administrators.some((admin) => admin.userId === session.userId);

  // A draft is private to its administrators. Only a published community is visible to
  // anyone else — see docs/security.md "never expose private content".
  if (!isAdmin && community.publicationStatus !== "PUBLISHED") {
    notFound();
  }

  const rule = community.accessRules[0];
  const network = rule ? SUPPORTED_CHAINS.find((chain) => chain.chainId === rule.chainId) : undefined;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-cream">{community.name}</h1>
          <p className="text-sm text-cream-muted">${community.ticker}</p>
        </div>
        <Link href="/app" className="text-sm text-electric-blue hover:underline">
          Back to Explore
        </Link>
      </div>

      {isAdmin ? (
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="neutral">{LIFECYCLE_LABEL[community.lifecycleStatus] ?? community.lifecycleStatus}</StatusBadge>
          <StatusBadge tone={community.verificationStatus === "VERIFIED" ? "verified" : "neutral"}>
            {VERIFICATION_LABEL[community.verificationStatus] ?? community.verificationStatus}
          </StatusBadge>
          <StatusBadge tone="neutral">
            {community.publicationStatus === "PUBLISHED" ? "Published" : "Unpublished"}
          </StatusBadge>
        </div>
      ) : null}

      <p className="text-sm text-cream-muted">{community.description}</p>

      {rule ? (
        <div className="rounded-2xl border border-midnight-border bg-midnight-raised p-4 text-sm">
          <p className="font-semibold text-cream">Token gate</p>
          <p className="mt-1 text-cream-muted">
            {network?.name ?? `Chain ${rule.chainId}`} · {rule.tokenContractAddress}
          </p>
          <p className="text-cream-muted">
            Minimum balance: {formatTokenAmount(BigInt(rule.minimumTokenBalance.toFixed(0)), rule.tokenDecimals)}{" "}
            {community.ticker}
          </p>
        </div>
      ) : null}

      {isAdmin && community.lifecycleStatus === "DRAFT" ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-midnight-border bg-midnight-raised p-4">
          <p className="text-sm text-cream-muted">
            This draft is only visible to you and other administrators. Submitting it for
            verification does not publish it automatically — a Gatehouse reviewer confirms the
            project before it goes live.
          </p>
          <SubmitForVerificationButton communityId={community.id} />
        </div>
      ) : null}

      {isAdmin && community.lifecycleStatus === "IN_REVIEW" ? (
        <p className="text-sm text-soft-lilac">Submitted — waiting on Gatehouse review.</p>
      ) : null}
    </div>
  );
}
