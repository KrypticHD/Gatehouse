import type { IllustrativeCommunity } from "@/lib/fixtures/communities";
import { StatusBadge } from "@/components/ui/StatusBadge";

const VERIFICATION_LABEL: Record<IllustrativeCommunity["verification"], string> = {
  verified: "Verified",
  pending: "Verification pending",
  unverified: "Unverified",
};

const FEATURE_LABEL: Record<string, string> = {
  announcements: "Announcements",
  discussions: "Discussions",
};

export function CommunityCard({ community }: { community: IllustrativeCommunity }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-midnight-border bg-midnight-raised p-4 transition hover:border-electric-blue/50">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-midnight text-2xl"
        >
          {community.artworkEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-cream">{community.name}</h3>
            {community.isPlatformCommunity ? <StatusBadge tone="coral">Gatehouse</StatusBadge> : null}
          </div>
          <p className="text-sm text-cream-muted">${community.ticker}</p>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-cream-muted">{community.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="neutral">{community.network}</StatusBadge>
        <StatusBadge tone={community.verification === "verified" ? "verified" : community.verification === "pending" ? "pending" : "neutral"}>
          {VERIFICATION_LABEL[community.verification]}
        </StatusBadge>
        {community.features.map((feature) => (
          <StatusBadge key={feature} tone="neutral">
            {FEATURE_LABEL[feature] ?? feature}
          </StatusBadge>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-midnight-border pt-3 text-xs text-cream-muted">
        <span>Min. balance: {community.minimumTokenBalanceDisplay}</span>
        <button
          type="button"
          className="min-h-11 rounded-full border border-cream/20 px-4 text-sm font-medium text-cream transition hover:bg-cream/10"
        >
          View
        </button>
      </div>
    </article>
  );
}
