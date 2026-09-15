import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gatehouse — Your token. Your people.",
  description:
    "One wallet. Find your community. Gatehouse discovers every crypto community your token holdings unlock.",
};

/**
 * Deliberately minimal — this is the only place `<html>`/`<body>` can be declared, so it
 * carries no background/text-color/app-shell assumptions of its own. The public landing
 * page (src/app/page.tsx) and the gated app (src/app/(gated)/layout.tsx) each paint their
 * own full-bleed background; sharing one here would leak between two visually unrelated
 * experiences.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
