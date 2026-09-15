export const EXPLORE_FILTERS = ["All", "Discussions", "Voting", "Rewards"] as const;

export type ExploreFilter = (typeof EXPLORE_FILTERS)[number];

export function FilterTabs({
  value,
  onChange,
}: {
  value: ExploreFilter;
  onChange: (value: ExploreFilter) => void;
}) {
  return (
    <div role="tablist" aria-label="Filter communities" className="flex gap-2 overflow-x-auto pb-1">
      {EXPLORE_FILTERS.map((filter) => {
        const isActive = filter === value;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition ${
              isActive
                ? "border-electric-blue bg-electric-blue text-cream"
                : "border-midnight-border bg-midnight-raised text-cream-muted hover:text-cream"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
