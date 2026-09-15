"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { CommunitiesApiError, createCommunity } from "@/lib/api/communities-client";
import { fetchSession } from "@/lib/api/auth-client";
import { slugifyName } from "@/lib/slug";
import { SUPPORTED_CHAINS } from "@/lib/validation/community-draft";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

const inputClasses =
  "w-full rounded-xl border border-midnight-border bg-midnight-raised px-3 py-2.5 text-sm text-cream placeholder:text-cream-muted focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/40 focus:outline-none";
const labelClasses = "text-sm font-medium text-cream";

export default function CreateCommunityPage() {
  const router = useRouter();
  const sessionQuery = useQuery({ queryKey: ["auth-session"], queryFn: fetchSession });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [artworkUrl, setArtworkUrl] = useState("");
  const [chainId, setChainId] = useState<number>(SUPPORTED_CHAINS[0].chainId);
  const [tokenContractAddress, setTokenContractAddress] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("18");
  const [minimumTokenBalance, setMinimumTokenBalance] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugifyName(value));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const { slug: createdSlug } = await createCommunity({
        name,
        slug,
        ticker,
        description,
        artworkUrl: artworkUrl.trim() === "" ? undefined : artworkUrl.trim(),
        chainId,
        tokenContractAddress,
        tokenDecimals: Number(tokenDecimals),
        minimumTokenBalance,
      });
      router.push(`/app/communities/${createdSlug}`);
    } catch (error) {
      if (error instanceof CommunitiesApiError) {
        if (error.message === "slug_taken") {
          setFieldErrors({ slug: "That slug is already taken." });
        } else if (error.details?.fieldErrors) {
          const flat: Record<string, string> = {};
          for (const [field, messages] of Object.entries(error.details.fieldErrors)) {
            if (messages?.[0]) flat[field] = messages[0];
          }
          setFieldErrors(flat);
        } else {
          setFormError("Couldn't create the community. Please check your details and try again.");
        }
      } else {
        setFormError("Couldn't create the community. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (sessionQuery.isLoading) {
    return null;
  }

  if (!sessionQuery.data?.authenticated) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-midnight-border bg-midnight-raised px-6 py-16 text-center">
        <p className="text-base font-semibold text-cream">Connect and sign in to create a community</p>
        <p className="max-w-sm text-sm text-cream-muted">
          Gatehouse verifies who administers a community by wallet — connect and sign in first.
        </p>
        <ConnectWalletButton />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-cream">Create a community</h1>
        <p className="text-sm text-cream-muted">
          Every Gatehouse community is gated by a token you already control the contract address
          for. This creates a draft — nothing is published or verified until you submit it for
          review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-midnight-border bg-midnight-raised p-4">
          <h2 className="text-sm font-semibold text-cream-muted uppercase tracking-wide">Project details</h2>

          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Name</span>
            <input
              className={inputClasses}
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Moon Pigeon"
              required
              maxLength={64}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Slug</span>
            <input
              className={inputClasses}
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugTouched(true);
              }}
              placeholder="moon-pigeon"
              required
              maxLength={48}
            />
            <span className="text-xs text-cream-muted">gatehouse.app/app/communities/{slug || "…"}</span>
            {fieldErrors.slug ? <span className="text-xs text-warm-coral">{fieldErrors.slug}</span> : null}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Ticker</span>
            <input
              className={inputClasses}
              value={ticker}
              onChange={(event) => setTicker(event.target.value)}
              placeholder="COO"
              required
              maxLength={12}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Description</span>
            <textarea
              className={`${inputClasses} min-h-24 resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this community about?"
              required
              maxLength={2000}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Artwork URL (optional)</span>
            <input
              className={inputClasses}
              value={artworkUrl}
              onChange={(event) => setArtworkUrl(event.target.value)}
              placeholder="https://…"
              type="url"
            />
            <span className="text-xs text-cream-muted">
              Direct image uploads aren&apos;t available yet — paste a hosted image URL for now.
            </span>
          </label>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-midnight-border bg-midnight-raised p-4">
          <h2 className="text-sm font-semibold text-cream-muted uppercase tracking-wide">
            Token gate — required
          </h2>
          <p className="text-xs text-cream-muted">
            Every community is linked to its own token. Holders need at least this balance of
            this exact token, on this network, to be recognised as a member.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>Network</span>
            <select
              className={inputClasses}
              value={chainId}
              onChange={(event) => setChainId(Number(event.target.value))}
            >
              {SUPPORTED_CHAINS.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name}
                  {chain.isTestnet ? " (testnet)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClasses}>ERC-20 token contract address</span>
            <input
              className={inputClasses}
              value={tokenContractAddress}
              onChange={(event) => setTokenContractAddress(event.target.value)}
              placeholder="0x…"
              required
            />
            {fieldErrors.tokenContractAddress ? (
              <span className="text-xs text-warm-coral">{fieldErrors.tokenContractAddress}</span>
            ) : null}
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className={labelClasses}>Token decimals</span>
              <input
                className={inputClasses}
                value={tokenDecimals}
                onChange={(event) => setTokenDecimals(event.target.value)}
                type="number"
                min={0}
                max={36}
                required
              />
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className={labelClasses}>Minimum balance</span>
              <input
                className={inputClasses}
                value={minimumTokenBalance}
                onChange={(event) => setMinimumTokenBalance(event.target.value)}
                placeholder="1000"
                required
              />
              {fieldErrors.minimumTokenBalance ? (
                <span className="text-xs text-warm-coral">{fieldErrors.minimumTokenBalance}</span>
              ) : null}
            </label>
          </div>
        </section>

        {formError ? <p className="text-sm text-warm-coral">{formError}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-warm-coral px-5 text-sm font-semibold text-midnight transition hover:brightness-105 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create draft"}
        </button>
      </form>
    </div>
  );
}
