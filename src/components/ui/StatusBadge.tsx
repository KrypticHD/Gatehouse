import type { ReactNode } from "react";

type StatusBadgeTone = "verified" | "pending" | "neutral" | "coral";

const TONE_CLASSES: Record<StatusBadgeTone, string> = {
  verified: "bg-electric-blue/15 text-electric-blue border-electric-blue/30",
  pending: "bg-soft-lilac/15 text-soft-lilac border-soft-lilac/30",
  neutral: "bg-cream/10 text-cream-muted border-cream/15",
  coral: "bg-warm-coral/15 text-warm-coral border-warm-coral/30",
};

export function StatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: StatusBadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
