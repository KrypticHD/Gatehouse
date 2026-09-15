"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CommunityCard } from "@/components/explore/CommunityCard";
import { ConnectionStatusLine } from "@/components/explore/ConnectionStatusLine";
import { ExploreHero } from "@/components/explore/ExploreHero";
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
    <div className="flex flex-col gap-5">
      <ExploreHero />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h1 className="text-xl font-semibold text-cream">Explore communities</h1>

          <Link
            href="/app/create"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-warm-coral px-4 text-sm font-semibold text-midnight transition hover:brightness-105"
          >
            Create community
          </Link>
        </div>

        <ConnectionStatusLine />

        <SearchBar value={query} onChange={setQuery} />
        <FilterTabs value={filter} onChange={setFilter} />
      </section>

      <section className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center rounded-full border border-midnight-border bg-midnight-raised px-2.5 py-1 text-[11px] font-medium tracking-wide text-cream-muted uppercase">
          Demo communities
        </span>

        {plannedNotice ? (
          <EmptyState icon="🗺️" title={`${filter} is coming soon`} description={plannedNotice} />
        ) : results.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No communities match your search"
            description="Try a different name, ticker or token address."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {results.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
