import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// --- Card -------------------------------------------------------------------

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <As
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function CardHeader({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
        <div>
          <h2 className="text-base font-semibold text-foreground sm:text-lg">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// --- Badge ------------------------------------------------------------------

export type BadgeTone =
  | "neutral"
  | "primary"
  | "high"
  | "elevated"
  | "caution"
  | "none"
  | "unknown";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted border-border",
  primary: "bg-primary-soft text-primary border-transparent",
  high: "bg-[var(--risk-high-soft)] text-[var(--risk-high)] border-transparent",
  elevated:
    "bg-[var(--risk-elevated-soft)] text-[var(--risk-elevated)] border-transparent",
  caution: "bg-[var(--risk-caution-soft)] text-[var(--risk-caution)] border-transparent",
  none: "bg-[var(--risk-none-soft)] text-[var(--risk-none)] border-transparent",
  unknown: "bg-[var(--risk-unknown-soft)] text-[var(--risk-unknown)] border-transparent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        BADGE_TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// --- Alert ------------------------------------------------------------------

export type AlertTone = "info" | "caution" | "danger" | "success" | "neutral";

const ALERT_TONES: Record<
  AlertTone,
  { container: string; icon: ReactNode }
> = {
  info: {
    container: "border-border bg-surface-muted text-foreground",
    icon: <Info className="size-5 text-primary" aria-hidden="true" />,
  },
  caution: {
    container:
      "border-[var(--risk-caution)]/40 bg-[var(--risk-caution-soft)] text-foreground",
    icon: <AlertTriangle className="size-5 text-[var(--risk-caution)]" aria-hidden="true" />,
  },
  danger: {
    container: "border-[var(--risk-high)]/40 bg-[var(--risk-high-soft)] text-foreground",
    icon: <OctagonAlert className="size-5 text-[var(--risk-high)]" aria-hidden="true" />,
  },
  success: {
    container: "border-[var(--risk-none)]/40 bg-[var(--risk-none-soft)] text-foreground",
    icon: <CheckCircle2 className="size-5 text-[var(--risk-none)]" aria-hidden="true" />,
  },
  neutral: {
    container: "border-border bg-surface text-foreground",
    icon: <XCircle className="size-5 text-muted" aria-hidden="true" />,
  },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
  role,
}: {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  const config = ALERT_TONES[tone];
  return (
    <div
      role={role ?? (tone === "danger" ? "alert" : undefined)}
      className={cn(
        "flex gap-3 rounded-xl border p-3.5 text-sm sm:p-4",
        config.container,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? (
          <div className={cn("text-sm leading-relaxed", title ? "mt-1" : undefined)}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// --- Empty state ------------------------------------------------------------

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-strong bg-surface-muted/50 px-6 py-10 text-center">
      {icon ? <div className="mb-3 text-muted">{icon}</div> : null}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

// --- Skeleton ---------------------------------------------------------------

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton rounded-lg", className)}
      aria-hidden="true"
      role="presentation"
    />
  );
}
