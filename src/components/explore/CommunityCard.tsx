import type { ComponentType } from "react";

import type { CommunityCoverAccent, IllustrativeCommunity } from "@/lib/fixtures/communities";
import { GatehouseLogoMark } from "@/components/brand/GatehouseLogoMark";
import { CheckBadgeIcon, ChatIcon, ClockIcon, DashIcon, LockIcon, MegaphoneIcon } from "@/components/explore/icons";

const COVER_GRADIENT: Record<CommunityCoverAccent, string> = {
  "blue-lilac": "linear-gradient(135deg, #476CFF 0%, #B5A1ED 100%)",
  "lilac-midnight": "linear-gradient(135deg, #B5A1ED 0%, #1B2242 100%)",
  "midnight-blue": "linear-gradient(135deg, #1B2242 0%, #476CFF 100%)",
};

const AVATAR_BACKGROUND: Record<CommunityCoverAccent, string> = {
  "blue-lilac": "#476CFF",
  "lilac-midnight": "#B5A1ED",
  "midnight-blue": "#2A3260",
};

const VERIFICATION_CONFIG: Record<
  IllustrativeCommunity["verification"],
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  verified: { label: "Verified · Demo", className: "text-electric-blue", icon: CheckBadgeIcon },
  pending: { label: "Pending · Demo", className: "text-soft-lilac", icon: ClockIcon },
  unverified: { label: "Unverified · Demo", className: "text-cream-muted", icon: DashIcon },
};

const FEATURE_CONFIG: Record<
  IllustrativeCommunity["features"][number],
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  announcements: { label: "Announcements", icon: MegaphoneIcon },
  discussions: { label: "Discussions", icon: ChatIcon },
};

/** Faint dot-grid texture built entirely from a radial-gradient — no external image. */
const COVER_TEXTURE =
  "radial-gradient(circle, rgba(247,242,233,0.25) 1px, transparent 1px)";

export function CommunityCard({ community }: { community: IllustrativeCommunity }) {
  const verification = VERIFICATION_CONFIG[community.verification];
  const VerificationIcon = verification.icon;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-midnight-border bg-midnight-raised transition hover:border-electric-blue/50">
      <div
        className="relative h-24 w-full sm:h-28"
        style={{
          backgroundImage: `${COVER_TEXTURE}, ${COVER_GRADIENT[community.coverAccent]}`,
          backgroundSize: "14px 14px, cover",
        }}
      >
        <span className="absolute top-2 left-2 rounded-full border border-cream/15 bg-midnight/70 px-2 py-0.5 text-[11px] font-medium text-cream backdrop-blur">
          {community.network}
        </span>
      </div>

      <div className="px-4">
        <div
          className="relative -mt-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl ring-4 ring-midnight-raised sm:-mt-7 sm:h-14 sm:w-14"
          style={{
            backgroundColor: community.isPlatformCommunity ? "#141A35" : AVATAR_BACKGROUND[community.coverAccent],
          }}
        >
          {community.isPlatformCommunity ? (
            <GatehouseLogoMark fill className="p-1.5" />
          ) : (
            <span className="text-lg font-bold text-midnight sm:text-xl">{community.avatarLetter}</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pt-2 pb-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-cream">{community.name}</h3>
            <span className={`flex shrink-0 items-center gap-1 text-xs font-medium ${verification.className}`}>
              <VerificationIcon />
              {verification.label}
            </span>
          </div>
          <p className="text-sm text-cream-muted">${community.ticker}</p>
        </div>

        <p className="line-clamp-2 text-sm text-cream-muted">{community.description}</p>

        <p className="flex items-center gap-1.5 text-xs text-soft-lilac">
          <LockIcon />
          Requires {community.minimumTokenBalanceDisplay}
        </p>

        <div className="mt-auto flex flex-col gap-3 border-t border-midnight-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {community.features.map((feature) => {
              const config = FEATURE_CONFIG[feature];
              const FeatureIcon = config.icon;
              return (
                <li key={feature} className="flex items-center gap-1 text-xs text-cream-muted">
                  <FeatureIcon />
                  <span>{config.label}</span>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-full border border-electric-blue/50 px-4 text-sm font-medium text-electric-blue transition hover:bg-electric-blue/10 sm:w-auto"
          >
            View community
          </button>
        </div>
      </div>
    </article>
  );
}
