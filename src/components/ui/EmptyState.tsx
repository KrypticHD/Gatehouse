import type { ReactNode } from "react";

export function EmptyState({
  icon = "🔍",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-midnight-border bg-midnight-raised px-6 py-12 text-center">
      <span aria-hidden className="text-4xl">
        {icon}
      </span>
      <p className="text-base font-semibold text-cream">{title}</p>
      {description ? <p className="max-w-sm text-sm text-cream-muted">{description}</p> : null}
      {action}
    </div>
  );
}
