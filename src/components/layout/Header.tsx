"use client";

import Link from "next/link";
import { useState } from "react";

import { GatehouseLogoMark } from "@/components/brand/GatehouseLogoMark";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

const NAV_LINKS = [
  { href: "/", label: "Explore" },
  { href: "/my-communities", label: "My communities" },
  { href: "/rewards", label: "Rewards" },
];

/**
 * Compact website header, not a native-app nav bar: a normal top bar plus a disclosure menu
 * for small screens, no fixed bottom tab bar.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-midnight-border bg-midnight/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-electric-blue">
          <GatehouseLogoMark size={36} priority />
          <span className="text-lg font-semibold tracking-tight text-cream">Gatehouse</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-cream-muted transition hover:text-cream"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ConnectWalletButton className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-cream transition hover:bg-cream/10 md:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-midnight-border px-4 py-2 md:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center text-sm font-medium text-cream-muted transition hover:text-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="py-2 sm:hidden">
              <ConnectWalletButton />
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
