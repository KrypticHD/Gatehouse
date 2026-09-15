import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

/**
 * A curated wallet list rather than RainbowKit's `getDefaultConfig()` — its default list
 * includes the newer Coinbase "Base Account" connector, which pulls in `@coinbase/cdp-sdk`
 * and, transitively, an optional Solana/x402 payment module (`@x402/svm/exact/client`) that
 * isn't installed and fails Next.js's static build analysis (dynamic `import()` targets must
 * resolve at build time). None of that is relevant to Gatehouse (EVM-only, no payments in
 * this phase), so it's simplest to just not include that connector.
 *
 * This still covers a browser-extension wallet (MetaMask), WalletConnect (any mobile wallet,
 * via QR/deep link — no extension needed), classic Coinbase Wallet, and Rainbow. The
 * WalletConnect project ID is free (cloud.walletconnect.com) and only identifies the app to
 * WalletConnect's relay — it carries no funds/permissions itself.
 */
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — WalletConnect (mobile wallet) connections will not work. Get a free project ID at https://cloud.walletconnect.com.",
  );
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet, rainbowWallet],
    },
  ],
  {
    appName: "Gatehouse",
    projectId: walletConnectProjectId || "missing-walletconnect-project-id",
  },
);

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors,
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
