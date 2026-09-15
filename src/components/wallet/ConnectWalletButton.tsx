"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";

import { truncateAddress } from "@/lib/address";
import { fetchNonce, fetchSession, logout as logoutRequest, verifySignature } from "@/lib/api/auth-client";

type FlowStatus = "idle" | "connecting" | "signing" | "verifying";

/**
 * Real wallet connection + Sign-In with Ethereum, via the browser-injected connector (no
 * WalletConnect project ID needed — see src/lib/wagmi-config.ts). Two explicit steps, matching
 * the product spec: connect the wallet, then separately sign a message to authenticate.
 * Never requests payment, token approval, or custody — signMessage only ever asks for a
 * plain-text signature.
 */
export function ConnectWalletButton({ className = "" }: { className?: string }) {
  const { address, isConnected, chainId } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<FlowStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const sessionQuery = useQuery({
    queryKey: ["auth-session"],
    queryFn: fetchSession,
    staleTime: 30_000,
  });

  const isAuthenticatedForCurrentWallet =
    sessionQuery.data?.authenticated && sessionQuery.data.address === address?.toLowerCase();

  async function handleConnect() {
    setError(null);
    setStatus("connecting");
    try {
      const injectedConnector = connectors.find((connector) => connector.type === "injected") ?? connectors[0];
      if (!injectedConnector) {
        throw new Error("No browser wallet found. Install MetaMask or another injected wallet.");
      }
      await connectAsync({ connector: injectedConnector });
    } catch (caughtError) {
      setError(describeConnectError(caughtError));
    } finally {
      setStatus("idle");
    }
  }

  async function handleSignIn() {
    if (!address || !chainId) return;
    setError(null);
    setStatus("signing");
    try {
      const { nonce, message } = await fetchNonce(address, chainId);
      const signature = await signMessageAsync({ message });
      setStatus("verifying");
      await verifySignature(nonce, signature);
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    } catch (caughtError) {
      setError(describeSignInError(caughtError));
    } finally {
      setStatus("idle");
    }
  }

  async function handleDisconnect() {
    setMenuOpen(false);
    await logoutRequest();
    await disconnectAsync();
    await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
  }

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleConnect}
          disabled={status === "connecting"}
          className={`inline-flex min-h-11 items-center justify-center rounded-full bg-warm-coral px-4 text-sm font-semibold text-midnight transition hover:brightness-105 disabled:opacity-60 ${className}`}
        >
          {status === "connecting" ? "Connecting…" : "Connect wallet"}
        </button>
        {error ? (
          <p role="alert" className="absolute top-full right-0 mt-1 w-56 text-right text-xs text-warm-coral">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  if (!isAuthenticatedForCurrentWallet) {
    return (
      <div className="relative flex items-center gap-2">
        <span className="hidden rounded-full border border-midnight-border bg-midnight-raised px-3 py-2 text-xs text-cream-muted sm:inline-block">
          {address ? truncateAddress(address) : ""}
        </span>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={status !== "idle"}
          className={`inline-flex min-h-11 items-center justify-center rounded-full bg-warm-coral px-4 text-sm font-semibold text-midnight transition hover:brightness-105 disabled:opacity-60 ${className}`}
        >
          {status === "signing" ? "Check your wallet…" : status === "verifying" ? "Verifying…" : "Sign in"}
        </button>
        {error ? (
          <p role="alert" className="absolute top-full right-0 mt-1 w-56 text-right text-xs text-warm-coral">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-electric-blue/50 bg-midnight-raised px-4 text-sm font-medium text-cream transition hover:bg-electric-blue/10 ${className}`}
      >
        <span aria-hidden className="h-2 w-2 rounded-full bg-electric-blue" />
        {address ? truncateAddress(address) : ""}
      </button>
      {menuOpen ? (
        <div className="absolute top-full right-0 z-30 mt-2 w-40 overflow-hidden rounded-xl border border-midnight-border bg-midnight-raised shadow-lg">
          <button
            type="button"
            onClick={handleDisconnect}
            className="flex min-h-11 w-full items-center px-4 text-sm text-cream transition hover:bg-cream/10"
          >
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}

function extractMessage(error: unknown): string {
  if (error && typeof error === "object" && "shortMessage" in error) {
    const shortMessage = (error as { shortMessage?: unknown }).shortMessage;
    if (typeof shortMessage === "string" && shortMessage.length > 0) {
      return shortMessage;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "";
}

function describeConnectError(error: unknown): string {
  const raw = extractMessage(error);
  if (/no injected|provider not found|no ethereum|not detected/i.test(raw)) {
    return "No browser wallet found. Install a wallet extension (e.g. MetaMask) and reload the page.";
  }
  if (/reject|denied|cancel/i.test(raw)) {
    return "Connection request was rejected.";
  }
  return raw || "Couldn't connect. Please try again.";
}

function describeSignInError(error: unknown): string {
  const raw = extractMessage(error);
  if (/reject|denied|cancel/i.test(raw)) {
    return "Signature request was rejected.";
  }
  if (raw === "nonce_expired") {
    return "That sign-in request expired. Please try again.";
  }
  if (raw === "nonce_already_used") {
    return "That sign-in request was already used. Please try again.";
  }
  if (raw === "signature_mismatch") {
    return "Signature didn't match. Please try again.";
  }
  return raw || "Sign-in failed. Please try again.";
}
