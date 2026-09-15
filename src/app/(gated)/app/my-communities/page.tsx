import Link from "next/link";

import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { getCurrentSession } from "@/server/auth/current-session";
import { prisma } from "@/server/db/client";

const LIFECYCLE_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

export default async function MyCommunitiesPage() {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-midnight-border bg-midnight-raised px-6 py-16 text-center">
        <p className="text-base font-semibold text-cream">Connect and sign in to see your communities</p>
        <ConnectWalletButton />
      </div>
    );
  }

  const communities = await prisma.community.findMany({
    where: { administrators: { some: { userId: session.userId } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-cream">My communities</h1>
        <Link
          href="/app/create"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-warm-coral px-4 text-sm font-semibold text-midnight transition hover:brightness-105"
        >
          Create community
        </Link>
      </div>

      {communities.length === 0 ? (
        <EmptyState
          icon="🏗️"
          title="You don't administer any communities yet"
          description="Create a draft, link it to your project's token, and submit it for verification when you're ready."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {communities.map((community) => (
            <li key={community.id}>
              <Link
                href={`/app/communities/${community.slug}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-midnight-border bg-midnight-raised p-4 transition hover:border-electric-blue/50"
              >
                <div>
                  <p className="font-semibold text-cream">{community.name}</p>
                  <p className="text-sm text-cream-muted">${community.ticker}</p>
                </div>
                <StatusBadge tone="neutral">
                  {LIFECYCLE_LABEL[community.lifecycleStatus] ?? community.lifecycleStatus}
                </StatusBadge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
