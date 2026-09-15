/**
 * Illustrative development data for the Explore page.
 *
 * These are NOT rows from the database — Gatehouse has no real communities yet. Every
 * consumer of this module must keep the "illustrative development data" labelling visible
 * in the UI (see src/app/(marketing)/page.tsx) so nobody mistakes it for real activity,
 * member counts or returns.
 */

export type CommunityNetwork = "Ethereum" | "Sepolia";

export type CommunityFeature = "announcements" | "discussions";

export type CommunityVerificationBadge = "verified" | "pending" | "unverified";

export interface IllustrativeCommunity {
  id: string;
  slug: string;
  name: string;
  ticker: string;
  description: string;
  /** Emoji placeholder stands in for project artwork until real uploads exist. */
  artworkEmoji: string;
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
    artworkEmoji: "🏠",
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
    artworkEmoji: "🐦",
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
    artworkEmoji: "🍞",
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
    artworkEmoji: "🐈",
    network: "Ethereum",
    minimumTokenBalanceDisplay: "10,000 MEOW",
    verification: "unverified",
    features: ["announcements", "discussions"],
  },
];
