"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Ban,
  BookOpenText,
  Brain,
  ExternalLink,
  HelpCircle,
  Info,
  Link2,
  ListChecks,
  Phone,
  Quote,
  Save,
  ScanSearch,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { contentTypeLabels } from "@/lib/i18n/labels";
import type { AnalysisResult, Finding, RiskLevel } from "@/lib/types-app";
import { Card, CardHeader, Alert, Badge, EmptyState } from "@/components/ui/surfaces";
import { Button, ButtonLink } from "@/components/ui/button";
import { RiskHeadline, SeverityBadge } from "@/components/ui/risk";
import {
  useCapabilities,
  useHistory,
  usePreferences,
} from "@/components/providers/app-providers";
import { RESOURCES_LAST_VERIFIED } from "@/lib/content/resources";
import { cn } from "@/lib/utils/cn";

/**
 * Screen F — analysis result.
 *
 * Ordering is deliberate and matches how a frightened user reads:
 * category → what it looks like → the evidence → what to do → what not to do →
 * what we could not determine → engine honesty → official help.
 *
 * Every warning sign shows the exact excerpt that triggered it. Nothing here is
 * generated text that was not in the submission.
 */

const SOURCE_ICON = {
  rule: ScanSearch,
  ai: Brain,
  structure: Link2,
  reputation: BadgeCheck,
} as const;

export function ResultView({
  result,
  onAnalyzeAnother,
}: {
  result: AnalysisResult;
  onAnalyzeAnother?: () => void;
}) {
  const { t, lang } = useI18n();
  const caps = useCapabilities();
  const history = useHistory();
  const { historyEnabled } = usePreferences();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const saved = history.isSaved(result.id);
  const isUrlOnly = result.meta.rulesEvaluated === 0 && result.findings.some((f) => f.source === "structure");

  function handleSave() {
    const outcome = history.save(result);
    setSaveMessage(outcome.ok ? t.results.saved : (outcome.error ?? t.common.error));
  }

  return (
    <div className="space-y-4">
      <RiskHeadline level={result.riskLevel} score={result.riskScore} />

      <p className="px-1 text-xs text-muted">{t.results.scoreExplainer}</p>

      <Card>
        <CardHeader
          title={t.results.summary}
          icon={<Info className="size-5 text-primary" aria-hidden="true" />}
          action={
            <Badge tone="neutral" className="text-[11px]">
              {contentTypeLabels[result.contentType].label[lang]}
            </Badge>
          }
        />
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {result.summary}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-3">
          <div>
            <dt className="font-semibold">{t.results.confidenceLabel}</dt>
            <dd>
              {result.findings.length >= 2
                ? t.results.confidenceHigh
                : result.findings.length === 1
                  ? t.results.confidenceMedium
                  : t.results.confidenceLow}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{t.results.riskLevel}</dt>
            <dd>{t.results.risk[result.riskLevel].label}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t.results.checkedOn}</dt>
            <dd>{formatDateTime(result.createdAt, lang)}</dd>
          </div>
        </dl>
      </Card>

      {/* --- Warning signs ------------------------------------------------- */}
      <Card>
        <CardHeader
          title={t.results.warningSigns}
          description={
            result.findings.length > 0
              ? `${result.findings.length} ${t.results.findingsCount}`
              : undefined
          }
          icon={<AlertTriangle className="size-5 text-[var(--risk-caution)]" aria-hidden="true" />}
        />
        {result.findings.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={<ShieldCheck className="size-7" aria-hidden="true" />}
              title={t.results.noFindingsTitle}
              description={t.results.noFindingsBody}
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {result.findings.map((finding, index) => (
              <FindingCard key={`${finding.id ?? "ai"}-${index}`} finding={finding} />
            ))}
          </ul>
        )}
      </Card>

      {/* --- Actions -------------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={t.results.actions}
            icon={<ListChecks className="size-5 text-primary" aria-hidden="true" />}
          />
          <ol className="mt-3 space-y-2.5">
            {result.recommendedActions.map((action, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <CardHeader
            title={t.results.actionsToAvoid}
            icon={<Ban className="size-5 text-[var(--risk-high)]" aria-hidden="true" />}
          />
          <ul className="mt-3 space-y-2.5">
            {result.actionsToAvoid.map((action, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--risk-high)]"
                  aria-hidden="true"
                />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* --- Uncertainties -------------------------------------------------- */}
      <Card>
        <CardHeader
          title={t.results.uncertainties}
          icon={<HelpCircle className="size-5 text-muted" aria-hidden="true" />}
        />
        <ul className="mt-3 space-y-2">
          {result.uncertainties.map((item, index) => (
            <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-muted">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* --- Engine honesty ------------------------------------------------- */}
      <EnginePanel result={result} caps={caps} isUrlOnly={isUrlOnly} />

      {/* --- Resources ------------------------------------------------------ */}
      <Card>
        <CardHeader
          title={t.results.resources}
          description={t.safety.disclaimer}
          icon={<Phone className="size-5 text-primary" aria-hidden="true" />}
        />
        <ul className="mt-3 space-y-2">
          {result.resources.map((resource) => (
            <li key={resource.url}>
              <a
                href={resource.url}
                target={resource.url.startsWith("tel:") ? undefined : "_blank"}
                rel={resource.url.startsWith("tel:") ? undefined : "noopener noreferrer"}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-3 transition-colors hover:border-primary"
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  {resource.url.startsWith("tel:") ? (
                    <Phone className="size-4" aria-hidden="true" />
                  ) : (
                    <ExternalLink className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {resource.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                    {resource.reason}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          {t.safety.officialNotice}
          {" · "}
          {t.safety.lastVerified}: {RESOURCES_LAST_VERIFIED}
        </p>
      </Card>

      {/* --- Actions on the result ----------------------------------------- */}
      <div className="sticky bottom-2 z-10 rounded-2xl border border-border bg-surface/95 p-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={saved ? "secondary" : "primary"}
            onClick={handleSave}
            disabled={saved}
            className="flex-1 sm:flex-none"
          >
            <Save className="size-4" aria-hidden="true" />
            {saved ? t.common.saved : t.results.save}
          </Button>
          {onAnalyzeAnother ? (
            <Button type="button" variant="secondary" onClick={onAnalyzeAnother}>
              <ScanSearch className="size-4" aria-hidden="true" />
              {t.results.analyzeAnother}
            </Button>
          ) : (
            <ButtonLink href="/check/text" variant="secondary">
              <ScanSearch className="size-4" aria-hidden="true" />
              {t.results.analyzeAnother}
            </ButtonLink>
          )}
          <Link
            href="/emergency"
            className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-[var(--risk-high)] underline underline-offset-2"
          >
            {t.incident.title}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        {saveMessage ? (
          <p className="mt-2 text-xs text-muted" role="status">
            {saveMessage}
          </p>
        ) : null}
      </div>

      {!historyEnabled ? (
        <Alert tone="caution" title={t.saved.historyDisabledTitle}>
          {t.saved.historyDisabledBody}
        </Alert>
      ) : null}
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const { t } = useI18n();
  const Icon = SOURCE_ICON[finding.source] ?? ScanSearch;
  const unverified = finding.weight === 0 && finding.source === "ai";

  return (
    <li
      className={cn(
        "rounded-xl border p-3.5",
        finding.severity === "high"
          ? "border-[var(--risk-high)]/35 bg-[var(--risk-high-soft)]/40"
          : finding.severity === "medium"
            ? "border-[var(--risk-caution)]/35 bg-[var(--risk-caution-soft)]/40"
            : "border-border bg-surface-muted",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground">{finding.title}</h3>
        <SeverityBadge severity={finding.severity} />
      </div>

      <div className="mt-2.5 rounded-lg border border-border bg-surface px-3 py-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <Quote className="size-3" aria-hidden="true" />
          {t.results.evidenceLabel}
        </p>
        <p className="mt-1 break-words text-sm italic text-foreground">
          {finding.evidence}
        </p>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-foreground">
        <span className="font-semibold">{t.results.whyItMatters}: </span>
        {finding.explanation}
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1 font-semibold">
          <Icon className="size-3" aria-hidden="true" />
          {finding.source === "rule"
            ? t.results.sourceRule
            : finding.source === "ai"
              ? t.results.sourceAi
              : finding.source === "structure"
                ? t.results.sourceStructure
                : t.results.sourceReputation}
        </span>
        {finding.id ? <span className="font-mono">{finding.id}</span> : null}
        {unverified ? (
          <span className="font-semibold text-[var(--risk-caution)]">
            {t.results.notCounted}
          </span>
        ) : null}
      </p>
    </li>
  );
}

function EnginePanel({
  result,
  caps,
  isUrlOnly,
}: {
  result: AnalysisResult;
  caps: { ai: boolean; aiVision: boolean; urlReputation: boolean; cloudPersistence: boolean; mode: string };
  isUrlOnly: boolean;
}) {
  const { t } = useI18n();
  const { meta } = result;

  const aiLine = meta.aiUsed
    ? t.results.engineAssisted
    : meta.aiConfigured
      ? t.results.engineAiFailed
      : t.results.engineRulesOnly;

  const reputationLine = meta.reputationChecked
    ? t.results.reputationRan
    : t.results.reputationSkipped;

  return (
    <Card>
      <CardHeader
        title={t.results.limitationsTitle}
        icon={<ShieldCheck className="size-5 text-muted" aria-hidden="true" />}
      />
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
        <li className="flex gap-2.5">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted" aria-hidden="true" />
          {t.results.limitation1}
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted" aria-hidden="true" />
          {t.results.limitation2}
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted" aria-hidden="true" />
          {t.results.limitation3}
        </li>
      </ul>

      <dl className="mt-4 grid gap-2 rounded-xl border border-border bg-surface-muted p-3 text-xs sm:grid-cols-2">
        <MetaRow label={t.settings.engineMode}>
          {meta.aiUsed ? t.settings.modeAssisted : t.settings.modeRulesOnly}
        </MetaRow>
        <MetaRow label="AI">
          <span className={meta.aiUsed ? "text-[var(--risk-none)]" : "text-muted"}>{aiLine}</span>
        </MetaRow>
        <MetaRow label={t.settings.capReputation}>
          <span className={meta.reputationChecked ? "text-[var(--risk-none)]" : "text-muted"}>
            {reputationLine}
          </span>
        </MetaRow>
        <MetaRow label={t.results.rulesLabel}>
          {meta.rulesMatched} / {meta.rulesEvaluated}
        </MetaRow>
        <MetaRow label="Engine">{meta.engineVersion}</MetaRow>
        <MetaRow label="Hash">{meta.contentHash.slice(0, 12)}…</MetaRow>
        {meta.inputTruncated ? (
          <MetaRow label="Input">{t.results.truncatedNote}</MetaRow>
        ) : null}
        {meta.processingMs ? <MetaRow label="Time">{meta.processingMs} ms</MetaRow> : null}
      </dl>

      {meta.sensitiveInputDetected ? (
        <div className="mt-3">
          <Alert tone="caution" title={t.textAnalyzer.sensitiveWarningTitle}>
            <p className="text-xs">{t.textAnalyzer.redactedNotice}</p>
          </Alert>
        </div>
      ) : null}

      {isUrlOnly && !meta.reputationChecked ? (
        <div className="mt-3">
          <Alert tone="caution" title={t.url.basicOnlyTitle}>
            {t.url.basicOnlyBody}
          </Alert>
        </div>
      ) : null}

      <p className="mt-3 text-xs text-muted">{t.results.aiNotice}</p>
      <p className="mt-1 text-xs text-muted">{t.results.disclaimer}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={caps.cloudPersistence ? "primary" : "neutral"} className="text-[11px]">
          {caps.cloudPersistence ? t.status.cloudOn : t.status.cloudOff}
        </Badge>
        <Badge tone="neutral" className="text-[11px]">
          <BookOpenText className="size-3" aria-hidden="true" />
          {t.saved.rawNotStored}
        </Badge>
      </div>
    </Card>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="font-semibold text-muted">{label}</dt>
      <dd className="text-right text-foreground">{children}</dd>
    </div>
  );
}

export function formatDateTime(iso: string, lang: "en" | "hi"): string {
  try {
    return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Small helper used by the saved-checks list. */
export function RiskDot({ level }: { level: RiskLevel }) {
  const color =
    level === "high"
      ? "var(--risk-high)"
      : level === "elevated"
        ? "var(--risk-elevated)"
        : level === "caution"
          ? "var(--risk-caution)"
          : level === "no_obvious_red_flags"
            ? "var(--risk-none)"
            : "var(--risk-unknown)";
  return (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

export { Trash2 };
