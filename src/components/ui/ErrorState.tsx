export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-warm-coral/30 bg-warm-coral/10 px-6 py-10 text-center"
    >
      <span aria-hidden className="text-3xl">
        ⚠️
      </span>
      <p className="text-base font-semibold text-cream">{title}</p>
      <p className="max-w-sm text-sm text-cream-muted">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-full border border-cream/20 px-4 text-sm font-medium text-cream transition hover:bg-cream/10"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
