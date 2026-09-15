"use client";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-cream-muted" />
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search community, ticker or token address"
        aria-label="Search community, ticker or token address"
        className="h-12 w-full rounded-full border border-midnight-border bg-midnight-raised pr-4 pl-11 text-sm text-cream placeholder:text-cream-muted focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/40 focus:outline-none"
      />
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className={className}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16l-3.2-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
