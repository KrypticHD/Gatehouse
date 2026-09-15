import { ArrowRight, Check, LockKeyhole, MessageCircle, Sparkles, Vote, WalletCards } from "lucide-react";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import { WaitlistForm } from "./waitlist-form";

import "./coming-soon.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const xUrl = process.env.NEXT_PUBLIC_GATEHOUSE_X_URL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gatehouse-ten.vercel.app";

export const metadata: Metadata = {
  title: "Gatehouse — Your token. Your people.",
  description: "Connect one wallet and find every community your tokens unlock. Gatehouse is coming soon.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "Gatehouse — Your token. Your people.",
    description: "One wallet. Every community it unlocks. Join the early list.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gatehouse — Your token. Your people.",
    description: "One wallet. Every community it unlocks. Join the early list.",
  },
};

/**
 * Public "coming soon" landing page — the only thing an ordinary visitor can reach at /.
 * The pre-launch app lives at /app, behind src/middleware.ts's preview gate; nothing here
 * links to it. See docs/build-progress.md for how this integration is structured.
 */
export default function Home() {
  return (
    <main className={`coming-soon-page ${inter.variable}`}>
      <div className="page-shell">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Gatehouse home">
            <span className="brand-mark" aria-hidden="true">
              G
            </span>
            <span>Gatehouse</span>
          </a>
          <div className="nav-actions">
            <span className="build-status">
              <span /> Building in public
            </span>
            {xUrl ? (
              <a className="x-link" href={xUrl} target="_blank" rel="noreferrer">
                Follow on X <ArrowRight aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </nav>

        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles aria-hidden="true" /> The front door for onchain communities
            </p>
            <h1>
              Your token.
              <br />
              Your people.
              <br />
              <span>One place.</span>
            </h1>
            <p className="hero-text">
              Connect one wallet. Gatehouse finds the communities your tokens unlock—and puts their
              discussions, votes and rewards behind the same front door.
            </p>
            <WaitlistForm />
            <div className="trust-line" aria-label="Gatehouse principles">
              <span>
                <Check aria-hidden="true" /> No passwords
              </span>
              <span>
                <Check aria-hidden="true" /> Non-custodial
              </span>
              <span>
                <Check aria-hidden="true" /> Built for mobile
              </span>
            </div>
          </div>

          <div className="hero-art" aria-label="Gatehouse token portal illustration">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="token-chip chip-eth">ETH</div>
            <div className="token-chip chip-gate">$GATE</div>
            <div className="token-chip chip-erc">ERC-20</div>
            <img src="/brand/gatehouse-orb.webp" alt="Gatehouse three-dimensional G emblem" />
            <div className="access-card">
              <span className="access-icon">
                <LockKeyhole aria-hidden="true" />
              </span>
              <span>
                <small>Wallet recognised</small>
                <strong>3 gates unlocked</strong>
              </span>
            </div>
          </div>
        </section>

        <section className="flow" aria-label="How Gatehouse works">
          <div>
            <span>01</span>
            <strong>Connect</strong>
            <small>Your wallet is your login</small>
          </div>
          <ArrowRight aria-hidden="true" />
          <div>
            <span>02</span>
            <strong>Discover</strong>
            <small>See what your tokens unlock</small>
          </div>
          <ArrowRight aria-hidden="true" />
          <div>
            <span>03</span>
            <strong>Enter</strong>
            <small>Join the conversation</small>
          </div>
        </section>

        <section className="why-section">
          <div className="section-heading">
            <p className="eyebrow">Built around ownership</p>
            <h2>Crypto communities deserve a proper home.</h2>
            <p>No invite links, role bots or ten-tab setup. Your holdings prove where you belong.</p>
          </div>
          <div className="feature-grid">
            <article>
              <span className="feature-icon">
                <WalletCards aria-hidden="true" />
              </span>
              <p className="feature-number">01</p>
              <h3>One wallet. Every gate.</h3>
              <p>Gatehouse checks your holdings and shows every community you can enter.</p>
            </article>
            <article>
              <span className="feature-icon">
                <MessageCircle aria-hidden="true" />
              </span>
              <p className="feature-number">02</p>
              <h3>Something worth unlocking.</h3>
              <p>Private announcements and holder discussions live inside each community.</p>
            </article>
            <article>
              <span className="feature-icon">
                <Vote aria-hidden="true" />
              </span>
              <p className="feature-number">03</p>
              <h3>Hold. Vote. Shape it.</h3>
              <p>Projects can give holders a real voice in proposals and what gets built next.</p>
            </article>
          </div>
        </section>

        <section className="token-section">
          <div className="token-copy">
            <p className="eyebrow">The Gatehouse community</p>
            <h2>$GATE opens our gate first.</h2>
            <p>
              Gatehouse’s own community will use $GATE for access levels, roadmap votes, early feature
              testing and community participation. Full token details and verified addresses will be
              published before launch.
            </p>
          </div>
          <div className="token-panel" aria-label="Planned Gatehouse token utility">
            <p>Planned utility</p>
            <ul>
              <li>
                <span>01</span> Holder-only community
              </li>
              <li>
                <span>02</span> Product roadmap votes
              </li>
              <li>
                <span>03</span> Early feature access
              </li>
              <li>
                <span>04</span> Community rewards
              </li>
            </ul>
          </div>
        </section>

        <section className="final-cta">
          <span className="mini-mark" aria-hidden="true">
            G
          </span>
          <p className="eyebrow">The gates are forming</p>
          <h2>Get in before they open.</h2>
          <p>Join the early list for build updates, first access and the official launch announcement.</p>
          <WaitlistForm compact />
        </section>

        <footer>
          <div className="brand footer-brand">
            <span className="brand-mark" aria-hidden="true">
              G
            </span>
            <span>Gatehouse</span>
          </div>
          <p>One wallet. Every community it unlocks.</p>
          <details>
            <summary>Email privacy</summary>
            <p>We’ll only use your email for Gatehouse product and launch updates. You can unsubscribe at any time.</p>
          </details>
          <p className="warning">Never trust an unverified $GATE contract address. Official details will appear here first.</p>
        </footer>
      </div>
    </main>
  );
}
