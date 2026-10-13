"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * Route-level error boundary.
 *
 * Shows no stack trace, no message from the underlying error and no internals —
 * only a plain explanation and a way forward. The digest is displayed because it
 * is safe and makes a support conversation possible.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side logging keeps detail out of the browser.
    console.error("[trusttap] client error boundary", {
      digest: error.digest,
      name: error.name,
    });
  }, [error]);

  return (
    <div className="space-y-4 py-8 text-center">
      <AlertTriangle
        className="mx-auto size-10 text-[var(--risk-caution)]"
        aria-hidden="true"
      />
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
        This page could not be displayed. Your saved checks are stored on your device and are
        unaffected. If an emergency is involved, the helpline number is 1930.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-foreground"
        >
          Go to the dashboard
        </Link>
      </div>
      {error.digest ? (
        <p className="text-xs text-muted">Reference: {error.digest}</p>
      ) : null}
    </div>
  );
}
