"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Image as ImageIcon,
  LifeBuoy,
  Link2,
  MessageSquareWarning,
  Save,
  Settings as SettingsIcon,
  Siren,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { usePreferences, useHistory, useCapabilities } from "@/components/providers/app-providers";
import { MessageForm } from "@/components/analysis/message-form";
import { Card, CardHeader, Badge, EmptyState, Alert } from "@/components/ui/surfaces";
import { RiskBadge } from "@/components/ui/risk";
import { formatDateTime } from "@/components/analysis/result-view";

/**
 * Screen B — main dashboard.
 *
 * The most important action (paste and check) is the first thing on the page and
 * needs no account, no scrolling and no configuration.
 */
export default function DashboardPage() {
  const { t, lang } = useI18n();
  const { onboarded, hydrated } = usePreferences();
  const history = useHistory();
  const caps = useCapabilities();
  const router = useRouter();

  // First-time visitors meet the welcome screen once. They can skip it, and it
  // never blocks access to a safety check.
  useEffect(() => {
    if (hydrated && !onboarded) router.replace("/welcome");
  }, [hydrated, onboarded, router]);

  const recent = history.items.slice(0, 3);
  const highRiskCount = history.items.filter(
    (item) => item.riskLevel === "high" || item.riskLevel === "elevated",
  ).length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <p className="text-sm font-semibold text-primary">{t.dashboard.greeting}</p>
        <h1 className="mt-1 text-balance text-2xl font-bold leading-snug text-foreground sm:text-3xl">
          {t.onboarding.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t.dashboard.safetyMessage}</p>
      </section>

      {!caps.ai ? (
        <Alert tone="info" title={t.status.rulesOnlyBadge}>
          {t.settings.modeRulesOnly}. {t.status.reputationOff}.
        </Alert>
      ) : null}

      <Card>
        <CardHeader
          title={t.dashboard.quickCheckTitle}
          description={t.dashboard.quickCheckHint}
          icon={<MessageSquareWarning className="size-5 text-primary" aria-hidden="true" />}
          action={
            <Badge tone="neutral" className="text-[11px]">
              {t.common.tagline}
            </Badge>
          }
        />
        <div className="mt-4">
          <MessageForm variant="compact" />
        </div>
      </Card>

      {/* --- Other check methods -------------------------------------------- */}
      <section aria-labelledby="methods-heading">
        <h2 id="methods-heading" className="mb-2 px-1 text-sm font-semibold text-foreground">
          {t.dashboard.chooseMethod}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <MethodCard
            href="/check/text"
            icon={<MessageSquareWarning className="size-5" aria-hidden="true" />}
            title={t.nav.text}
            body={t.onboarding.point1Body}
          />
          <MethodCard
            href="/check/screenshot"
            icon={<ImageIcon className="size-5" aria-hidden="true" />}
            title={t.nav.screenshot}
            body={t.screenshot.subtitle}
          />
          <MethodCard
            href="/check/link"
            icon={<Link2 className="size-5" aria-hidden="true" />}
            title={t.nav.url}
            body={t.url.noAutoFetch}
          />
        </div>
      </section>

      {/* --- Emergency ------------------------------------------------------- */}
      <Card className="border-[var(--risk-high)]/40 bg-[var(--risk-high-soft)]/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--risk-high)] text-white"
            aria-hidden="true"
          >
            <Siren className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-foreground">{t.dashboard.emergencyTitle}</h2>
            <p className="mt-0.5 text-sm text-muted">{t.dashboard.emergencyBody}</p>
          </div>
          <Link
            href="/emergency"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--risk-high)] px-4 text-sm font-semibold text-white"
          >
            {t.dashboard.emergencyCta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Card>

      {/* --- Recent + stats -------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader
            title={t.dashboard.recentTitle}
            icon={<Clock className="size-5 text-muted" aria-hidden="true" />}
            action={
              history.items.length > 3 ? (
                <Link
                  href="/saved"
                  className="text-xs font-semibold text-primary underline underline-offset-2"
                >
                  {t.dashboard.recentViewAll}
                </Link>
              ) : null
            }
          />
          {recent.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                icon={<Save className="size-6" aria-hidden="true" />}
                title={t.saved.empty}
                description={t.saved.emptyBody}
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {recent.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.summary.slice(0, 90)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDateTime(item.createdAt, lang)}
                    </p>
                  </div>
                  <RiskBadge level={item.riskLevel} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title={t.settings.engineTitle}
              icon={<ShieldCheck className="size-5 text-primary" aria-hidden="true" />}
            />
            <dl className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-xs text-muted">{t.dashboard.statsChecks}</dt>
                <dd className="text-2xl font-bold tabular-nums text-foreground">
                  {history.items.length}
                </dd>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-xs text-muted">{t.dashboard.statsHighRisk}</dt>
                <dd className="text-2xl font-bold tabular-nums text-[var(--risk-high)]">
                  {highRiskCount}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone={caps.ai ? "primary" : "neutral"} className="text-[11px]">
                {caps.ai ? t.settings.modeAssisted : t.settings.modeRulesOnly}
              </Badge>
              <Badge tone={caps.urlReputation ? "primary" : "neutral"} className="text-[11px]">
                {caps.urlReputation ? t.settings.configured : t.status.reputationOff}
              </Badge>
              <Badge tone={caps.cloudPersistence ? "primary" : "neutral"} className="text-[11px]">
                {caps.cloudPersistence ? t.status.cloudOn : t.status.cloudOff}
              </Badge>
            </div>
          </Card>

          <Card>
            <ul className="space-y-1">
              <QuickLink href="/safety-center" icon={<LifeBuoy className="size-4" />} label={t.dashboard.safetyCta} />
              <QuickLink href="/learn" icon={<BookOpen className="size-4" />} label={t.dashboard.learnCta} />
              <QuickLink href="/saved" icon={<Save className="size-4" />} label={t.nav.saved} />
              <QuickLink href="/settings" icon={<SettingsIcon className="size-4" />} label={t.dashboard.settingsCta} />
            </ul>
          </Card>
        </div>
      </div>

      <Alert tone="caution" title={t.onboarding.notAffiliated}>
        {t.results.disclaimer}
      </Alert>
    </div>
  );
}

function MethodCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary"
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted">
          {body}
        </span>
      </span>
    </Link>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
      >
        <span className="text-muted" aria-hidden="true">
          {icon}
        </span>
        {label}
        <ArrowRight className="ml-auto size-3.5 text-muted" aria-hidden="true" />
      </Link>
    </li>
  );
}

export { TriangleAlert };
