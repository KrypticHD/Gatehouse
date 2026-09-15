import { GatehouseLogoMark } from "@/components/brand/GatehouseLogoMark";

/**
 * Compact illustrated hero: the supplied 3D mark plus the two brand lines. Deliberately
 * short so search and the community grid stay near the top of the viewport on mobile.
 */
export function ExploreHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-midnight-border bg-midnight-raised px-4 py-4 sm:px-6 sm:py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-8 h-32 w-32 rounded-full bg-electric-blue/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 left-10 h-28 w-28 rounded-full bg-soft-lilac/20 blur-3xl"
      />
      <div className="relative flex items-center gap-4">
        <GatehouseLogoMark size={64} priority className="shrink-0 sm:hidden" />
        <GatehouseLogoMark size={80} priority className="hidden shrink-0 sm:block" />
        <div className="min-w-0">
          <h1 className="text-xl leading-tight font-semibold tracking-tight text-cream sm:text-2xl">
            Your token. Your people.
          </h1>
          <p className="mt-1 text-sm text-cream-muted sm:text-base">
            One wallet. Find your community.
          </p>
        </div>
      </div>
    </section>
  );
}
