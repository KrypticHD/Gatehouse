import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // RainbowKit's index.js unconditionally references its "Base Account" wallet connector
  // internally (even though our own wallet list in src/lib/wagmi-config.ts doesn't use it),
  // which pulls in @coinbase/cdp-sdk. That package does dynamic import()s of optional
  // Solana/x402 payment sub-packages we don't have installed and don't need (Gatehouse is
  // EVM-only, no payments in this phase) — Next's bundler tries to resolve those statically
  // and fails the build. Marking it (and its own dependency) external means Node resolves
  // them at runtime instead, where the unused dynamic imports are simply never reached.
  serverExternalPackages: ["@coinbase/cdp-sdk", "@base-org/account"],
};

export default nextConfig;
