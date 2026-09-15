"use client";

import { useQuery } from "@tanstack/react-query";

import { truncateAddress } from "@/lib/address";
import { fetchSession } from "@/lib/api/auth-client";
import { PlugIcon } from "@/components/explore/icons";

export function ConnectionStatusLine() {
  const sessionQuery = useQuery({ queryKey: ["auth-session"], queryFn: fetchSession, staleTime: 30_000 });

  if (sessionQuery.data?.authenticated && sessionQuery.data.address) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-cream-muted">
        <span aria-hidden className="h-2 w-2 rounded-full bg-electric-blue" />
        Signed in as {truncateAddress(sessionQuery.data.address)}. Eligibility-based access
        isn&apos;t wired up yet — every community below is still shown to everyone.
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-sm text-cream-muted">
      <PlugIcon className="shrink-0" />
      Not connected — browsing public communities.
    </p>
  );
}
