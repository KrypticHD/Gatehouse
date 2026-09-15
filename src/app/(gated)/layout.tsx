import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";

import { Providers } from "../providers";
import "../globals.css";

/**
 * App shell for the pre-launch app (everything under /app) — Header, wallet/session
 * providers, and the padded content container. Reached only via the preview gate in
 * src/middleware.ts; the public landing page (src/app/page.tsx) has none of this.
 */
export default function GatedLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col bg-midnight text-cream">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </Providers>
  );
}
