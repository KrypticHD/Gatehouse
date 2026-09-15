"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { submitCommunityForVerification } from "@/lib/api/communities-client";

export function SubmitForVerificationButton({ communityId }: { communityId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    try {
      await submitCommunityForVerification(communityId);
      router.refresh();
    } catch {
      setError("Couldn't submit for verification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-warm-coral px-5 text-sm font-semibold text-midnight transition hover:brightness-105 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit for verification"}
      </button>
      {error ? <p className="text-sm text-warm-coral">{error}</p> : null}
    </div>
  );
}
