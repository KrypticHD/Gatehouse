"use client";

import { useState } from "react";

/**
 * Interface placeholder for wallet connection. Deliberately does not call any wallet SDK,
 * request a signature, or create a session — real Sign-In with Ethereum wiring is the next
 * implementation phase (see docs/build-progress.md). Clicking it only reveals a note so it's
 * never mistaken for working authentication.
 */
export function WalletButtonPlaceholder({ className = "" }: { className?: string }) {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowNotice((value) => !value)}
        aria-describedby="wallet-placeholder-notice"
        className={`inline-flex min-h-11 items-center justify-center rounded-full bg-warm-coral px-4 text-sm font-semibold text-midnight transition hover:brightness-105 active:brightness-95 ${className}`}
      >
        Connect wallet
      </button>
      {showNotice ? (
        <div
          id="wallet-placeholder-notice"
          role="status"
          className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-midnight-border bg-midnight-raised p-3 text-xs text-cream-muted shadow-lg"
        >
          Wallet connection is coming in the next Gatehouse build. No wallet SDK is wired up
          yet — this button is an interface placeholder only.
        </div>
      ) : null}
    </div>
  );
}
