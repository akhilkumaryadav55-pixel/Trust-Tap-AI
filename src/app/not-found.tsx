import Link from "next/link";

/** 404. Links back to the actions that matter rather than a dead end. */
export default function NotFound() {
  return (
    <div className="space-y-4 py-8 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-2xl font-bold text-foreground">We could not find that page</h1>
      <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
        The link may be mistyped or the page may have moved. Nothing you entered has been lost.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Go to the dashboard
        </Link>
        <Link
          href="/check/text"
          className="inline-flex min-h-11 items-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-foreground"
        >
          Check a message
        </Link>
        <Link
          href="/emergency"
          className="inline-flex min-h-11 items-center rounded-xl border border-[var(--risk-high)]/40 bg-[var(--risk-high-soft)] px-5 text-sm font-semibold text-[var(--risk-high)]"
        >
          I think I&apos;ve been scammed
        </Link>
      </div>
    </div>
  );
}
