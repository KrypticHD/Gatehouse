export function LoadingState({ label = "Loading communities…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-3"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-2xl border border-midnight-border bg-midnight-raised"
        />
      ))}
    </div>
  );
}
