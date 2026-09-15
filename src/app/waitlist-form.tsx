"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          company: form.get("company"),
          source: compact ? "footer" : "hero",
        }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(body.message || "Something went wrong.");
      setStatus("success");
      setMessage(body.message || "You’re on the early list.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Couldn’t save your email. Please try again.");
    }
  }

  return (
    <div className={compact ? "waitlist-wrap compact" : "waitlist-wrap"}>
      <form className="waitlist-form" onSubmit={submit}>
        <label className="sr-only" htmlFor={compact ? "email-footer" : "email-hero"}>
          Email address
        </label>
        <input
          id={compact ? "email-footer" : "email-hero"}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          required
          disabled={status === "loading"}
        />
        <input className="honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? (
            <LoaderCircle className="spin" aria-hidden="true" />
          ) : status === "success" ? (
            <Check aria-hidden="true" />
          ) : null}
          {status === "success" ? "You’re in" : "Get early access"}
          {status === "idle" || status === "error" ? <ArrowRight aria-hidden="true" /> : null}
        </button>
      </form>
      <p className={`form-note ${status}`} aria-live="polite">
        {message || "Build updates only. No spam. Unsubscribe any time."}
      </p>
    </div>
  );
}
