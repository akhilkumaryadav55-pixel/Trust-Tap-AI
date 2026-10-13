"use client";

import { ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX, Shield } from "lucide-react";
import type { RiskLevel } from "@/lib/types-app";
import { useI18n } from "@/lib/i18n";
import { Badge, type BadgeTone } from "./surfaces";
import { cn } from "@/lib/utils/cn";

/**
 * Risk presentation.
 *
 * The score is always rendered as an "indicative risk indicator score" and the
 * copy never implies a probability. Colour is never the only signal: every badge
 * carries an icon and a text label, so the result is readable in greyscale and
 * to a screen reader.
 */

export const riskTone: Record<RiskLevel, BadgeTone> = {
  high: "high",
  elevated: "elevated",
  caution: "caution",
  no_obvious_red_flags: "none",
  unable_to_assess: "unknown",
};

const RISK_ICONS: Record<RiskLevel, typeof Shield> = {
  high: ShieldAlert,
  elevated: ShieldAlert,
  caution: ShieldQuestion,
  no_obvious_red_flags: ShieldCheck,
  unable_to_assess: ShieldX,
};

const RISK_ACCENT: Record<RiskLevel, string> = {
  high: "var(--risk-high)",
  elevated: "var(--risk-elevated)",
  caution: "var(--risk-caution)",
  no_obvious_red_flags: "var(--risk-none)",
  unable_to_assess: "var(--risk-unknown)",
};

export function RiskBadge({
  level,
  size = "md",
}: {
  level: RiskLevel;
  size?: "sm" | "md";
}) {
  const { t } = useI18n();
  const Icon = RISK_ICONS[level];
  return (
    <Badge
      tone={riskTone[level]}
      className={size === "sm" ? "px-2 py-0.5 text-[11px]" : undefined}
      icon={<Icon className="size-3.5" aria-hidden="true" />}
    >
      {t.results.risk[level].label}
    </Badge>
  );
}

export function ScoreMeter({ score, level }: { score: number; level: RiskLevel }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className="space-y-2">
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-surface-muted"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Indicative risk indicator score"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${clamped}%`,
            backgroundColor: RISK_ACCENT[level],
          }}
        />
      </div>
    </div>
  );
}

export function RiskHeadline({
  level,
  score,
  className,
}: {
  level: RiskLevel;
  score: number;
  className?: string;
}) {
  const { t } = useI18n();
  const Icon = RISK_ICONS[level];
  return (
    <div
      className={cn(
        "rounded-2xl border-l-4 bg-surface p-4 sm:p-5",
        className,
      )}
      style={{ borderLeftColor: RISK_ACCENT[level] }}
    >
      <div className="flex items-start gap-3">
        <Icon
          className="mt-0.5 size-7 shrink-0"
          style={{ color: RISK_ACCENT[level] }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-foreground sm:text-xl">
            {t.results.risk[level].label}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {t.results.risk[level].description}
          </p>
          <div className="mt-3">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t.results.indicativeScore}
              </span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {clamped(score)} / 100
              </span>
            </div>
            <ScoreMeter score={score} level={level} />
          </div>
        </div>
      </div>
    </div>
  );
}

function clamped(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const { lang } = useI18n();
  const tone: BadgeTone =
    severity === "high" ? "high" : severity === "medium" ? "caution" : "neutral";
  const labels = {
    low: { en: "Low", hi: "कम" },
    medium: { en: "Medium", hi: "मध्यम" },
    high: { en: "High", hi: "उच्च" },
  } as const;
  return (
    <Badge tone={tone} className="px-2 py-0.5 text-[11px]">
      {labels[severity][lang]}
    </Badge>
  );
}
