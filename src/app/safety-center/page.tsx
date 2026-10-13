"use client";

import {
  BadgeIndianRupee,
  ExternalLink,
  Landmark,
  Lock,
  MessageSquareWarning,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  OFFICIAL_RESOURCES,
  RESOURCES_LAST_VERIFIED,
} from "@/lib/content/resources";
import { Card, CardHeader, Alert, Badge } from "@/components/ui/surfaces";

/**
 * Screen H — India Safety Center.
 *
 * Every link here comes from the allowlist in `lib/content/resources.ts`, and
 * the notice makes clear that TrustTap AI is an independent tool with no
 * government affiliation or endorsement.
 */
export default function SafetyCenterPage() {
  const { t, lang } = useI18n();

  const helpline = OFFICIAL_RESOURCES.find((r) => r.id === "helpline_1930")!;
  const ordered = OFFICIAL_RESOURCES.filter((resource) => resource.id !== "helpline_1930").sort(
    (a, b) => (a.safetyCenterOrder ?? 99) - (b.safetyCenterOrder ?? 99),
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t.safety.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.safety.subtitle}</p>
      </header>

      {/* Helpline first: it is the time-critical one. */}
      <Card className="border-[var(--risk-high)]/40 bg-[var(--risk-high-soft)]/40">
        <CardHeader
          title={t.safety.helplineTitle}
          icon={<Phone className="size-5 text-[var(--risk-high)]" aria-hidden="true" />}
          action={
            <span className="text-3xl font-black tracking-tight text-[var(--risk-high)]">
              {t.safety.helplineNumber}
            </span>
          }
        />
        <p className="mt-2 text-sm text-muted">{t.safety.helplineBody}</p>
        <a
          href="tel:1930"
          className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--risk-high)] px-5 text-base font-bold text-white"
        >
          <Phone className="size-5" aria-hidden="true" />
          {t.incident.callHelpline}
        </a>
        <p className="mt-2 text-xs text-muted">{helpline.reason[lang]}</p>
      </Card>

      {/* Which service to use */}
      <Card>
        <CardHeader
          title={t.safety.whenTitle}
          icon={<ShieldCheck className="size-5 text-primary" aria-hidden="true" />}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-muted p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BadgeIndianRupee className="size-4 text-[var(--risk-high)]" aria-hidden="true" />
              {t.safety.whenFinancialTitle}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              {t.safety.whenFinancialBody}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-muted p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageSquareWarning className="size-4 text-[var(--risk-caution)]" aria-hidden="true" />
              {t.safety.whenCommsTitle}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              {t.safety.whenCommsBody}
            </p>
          </div>
        </div>
      </Card>

      {/* Official links */}
      <Card>
        <CardHeader
          title={t.results.resources}
          description={t.safety.officialNotice}
          icon={<Landmark className="size-5 text-primary" aria-hidden="true" />}
        />
        <ul className="mt-3 space-y-2">
          {ordered.map((resource) => (
            <li key={resource.id}>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary"
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <ExternalLink className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                    {resource.title[lang]}
                    <Badge tone="neutral" className="text-[10px]">
                      Official
                    </Badge>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {resource.reason[lang]}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          {t.safety.lastVerified}: {RESOURCES_LAST_VERIFIED}
        </p>
      </Card>

      {/* Bank advice */}
      <Card>
        <CardHeader
          title={t.safety.bankTitle}
          icon={<BadgeIndianRupee className="size-5 text-primary" aria-hidden="true" />}
        />
        <ol className="mt-3 space-y-2.5 text-sm leading-relaxed">
          {[t.safety.bankStep1, t.safety.bankStep2, t.safety.bankStep3, t.safety.bankStep4].map(
            (step, index) => (
              <li key={index} className="flex gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ),
          )}
        </ol>
      </Card>

      {/* Evidence */}
      <Card>
        <CardHeader
          title={t.safety.evidenceTitle}
          icon={<ShieldCheck className="size-5 text-primary" aria-hidden="true" />}
        />
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          <li>· {t.safety.evidenceStep1}</li>
          <li>· {t.safety.evidenceStep2}</li>
          <li>· {t.safety.evidenceStep3}</li>
          <li>· {t.safety.evidenceStep4}</li>
        </ul>
      </Card>

      {/* Account security */}
      <Card>
        <CardHeader
          title={t.safety.passwordTitle}
          icon={<Lock className="size-5 text-primary" aria-hidden="true" />}
        />
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          <li>· {t.safety.passwordStep1}</li>
          <li>· {t.safety.passwordStep2}</li>
          <li>· {t.safety.passwordStep3}</li>
          <li>· {t.safety.passwordStep4}</li>
        </ul>
      </Card>

      <Alert tone="info" title={t.safety.officialNotice}>
        <p>{t.safety.disclaimer}</p>
        <p className="mt-2">{t.onboarding.notAffiliated}</p>
      </Alert>
    </div>
  );
}
