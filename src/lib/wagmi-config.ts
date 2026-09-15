import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

/**
 * Wallet connection uses the browser-injected connector (MetaMask, Rabby, Coinbase Wallet
 * extension, etc.) only — no WalletConnect Cloud project ID is configured or required. This
 * covers the large majority of desktop crypto users; WalletConnect (for mobile QR pairing)
 * can be added later by setting NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID and adding its connector
 * here, without touching anything else. See docs/architecture.md.
 *
 * `http()` with no URL uses each chain's built-in public RPC (viem's default), so no RPC
 * provider API key is required for this phase either.
 */
export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
