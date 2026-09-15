"use client";

import { useMemo, useState } from "react";

import { CommunityCard } from "@/components/explore/CommunityCard";
import { EXPLORE_FILTERS, FilterTabs, type ExploreFilter } from "@/components/explore/FilterTabs";
import { SearchBar } from "@/components/explore/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ILLUSTRATIVE_COMMUNITIES } from "@/lib/fixtures/communities";

const PLANNED_FILTER_COPY: Partial<Record<ExploreFilter, string>> = {
  Voting: "Advisory holder voting is a planned Gatehouse module — no community has it enabled yet.",
  Rewards: "Community rewards are a planned Gatehouse module — no community has it enabled yet.",
};

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ExploreFilter>(EXPLORE_FILTERS[0]);

  const results = useMemo(() => {
    const plannedNotice = PLANNED_FILTER_COPY[filter];
    if (plannedNotice) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    return ILLUSTRATIVE_COMMUNITIES.filter((community) => {
      const matchesFilter = filter === "All" || community.features.includes(filter.toLowerCase() as "discussions");
      const matchesQuery =
        normalizedQuery.length === 0 ||
        community.name.toLowerCase().includes(normalizedQuery) ||
        community.ticker.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  const plannedNotice = PLANNED_FILTER_COPY[filter];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-cream sm:text-3xl">Explore communities</h1>
          <p className="text-sm text-cream-muted">
            Your token. Your people. Connect a wallet to automatically find every community
            your holdings unlock — or browse without connecting.
          </p>
        </div>

        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-midnight-border bg-midnight-raised px-4 py-3 text-sm text-cream-muted"
        >
          <span aria-hidden>🔌</span>
          <span>You&apos;re browsing as a guest — not connected to a wallet.</span>
        </div>

        <SearchBar value={query} onChange={setQuery} />
        <FilterTabs value={filter} onChange={setFilter} />
      </section>

      <section aria-label="Illustrative development data notice">
        <p className="text-xs text-cream-muted/80">
          The communities below are illustrative development data, not real projects.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        {plannedNotice ? (
          <EmptyState icon="🗺️" title={`${filter} is coming soon`} description={plannedNotice} />
        ) : results.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No communities match your search"
            description="Try a different name, ticker or token address."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col items-center gap-3 rounded-2xl border border-midnight-border bg-midnight-raised px-6 py-8 text-center">
        <p className="text-base font-semibold text-cream">Bring your holders together.</p>
        <p className="max-w-sm text-sm text-cream-muted">
          Create a draft community, set your token gate and preview it before submitting for
          verification.
        </p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-warm-coral px-5 text-sm font-semibold text-midnight transition hover:brightness-105"
        >
          Create community
        </button>
      </section>
    </div>
  );
}
