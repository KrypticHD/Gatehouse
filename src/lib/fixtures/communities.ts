/**
 * Illustrative development data for the Explore page.
 *
 * These are NOT rows from the database — Gatehouse has no real communities yet, and none of
 * these four have real project artwork. Every consumer of this module must keep the "Demo
 * communities" labelling visible in the UI (see src/app/page.tsx) and must never present
 * `verification` as if it reflects a real review — see CommunityCard's demo-qualified badge
 * copy.
 */

export type CommunityNetwork = "Ethereum" | "Sepolia";

export type CommunityFeature = "announcements" | "discussions";

export type CommunityVerificationBadge = "verified" | "pending" | "unverified";

/**
 * No real cover/avatar artwork exists for these fixtures (only Gatehouse itself has approved
 * artwork — the supplied 3D mark). `coverAccent` picks one of a few tasteful abstract
 * gradient covers built entirely from brand tokens, and `avatarLetter` drives a plain
 * monogram avatar, so nothing here impersonates real project art. See
 * docs/build-progress.md for which real assets are still needed.
 */
export type CommunityCoverAccent = "blue-lilac" | "lilac-midnight" | "midnight-blue";

export interface IllustrativeCommunity {
  id: string;
  slug: string;
  name: string;
  ticker: string;
  description: string;
  coverAccent: CommunityCoverAccent;
  avatarLetter: string;
  network: CommunityNetwork;
  minimumTokenBalanceDisplay: string;
  verification: CommunityVerificationBadge;
  isPlatformCommunity?: boolean;
  /** Modules actually working in this phase. Voting/rewards are deliberately absent — they
   * are planned modules, not fake working features (see docs/build-progress.md). */
  features: CommunityFeature[];
}

export const ILLUSTRATIVE_COMMUNITIES: IllustrativeCommunity[] = [
  {
    id: "illustrative-gatehouse",
    slug: "gatehouse",
    name: "Gatehouse",
    ticker: "GATE",
    description:
      "Development updates, roadmap polls and feature discussions for the Gatehouse platform itself.",
    coverAccent: "blue-lilac",
    avatarLetter: "G",
    network: "Ethereum",
    minimumTokenBalanceDisplay: "1,000 GATE",
    verification: "verified",
    isPlatformCommunity: true,
    features: ["announcements", "discussions"],
  },
  {
    id: "illustrative-moon-pigeon",
    slug: "moon-pigeon",
    name: "Moon Pigeon",
    ticker: "COO",
    description: "A flock of holders exploring the stars together, one coo at a time.",
    coverAccent: "lilac-midnight",
    avatarLetter: "M",
    network: "Ethereum",
    minimumTokenBalanceDisplay: "5,000 COO",
    verification: "verified",
    features: ["announcements", "discussions"],
  },
  {
    id: "illustrative-sunny-toast",
    slug: "sunny-toast",
    name: "Sunny Toast",
    ticker: "TOAST",
    description: "Good mornings, good people — a breakfast-club community for early holders.",
    coverAccent: "midnight-blue",
    avatarLetter: "S",
    network: "Sepolia",
    minimumTokenBalanceDisplay: "250 TOAST",
    verification: "pending",
    features: ["announcements"],
  },
  {
    id: "illustrative-quiet-cat",
    slug: "quiet-cat",
    name: "Quiet Cat Collective",
    ticker: "MEOW",
    description: "A calmer corner for holders who'd rather lurk, vote and read than chat.",
    coverAccent: "blue-lilac",
    avatarLetter: "Q",
    network: "Ethereum",
    minimumTokenBalanceDisplay: "10,000 MEOW",
    verification: "unverified",
    features: ["announcements", "discussions"],
  },
];
