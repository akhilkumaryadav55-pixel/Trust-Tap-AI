"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  Phone,
  Siren,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PLAYBOOKS, getPlaybook } from "@/lib/content/incident";
import { OFFICIAL_RESOURCES, resolveResources } from "@/lib/content/resources";
import { Card, CardHeader, Alert, Badge } from "@/components/ui/surfaces";
import { Button, ButtonLink } from "@/components/ui/button";
import type { IncidentSituation } from "@/lib/types-app";
import { cn } from "@/lib/utils/cn";

/**
 * Screen G — incident-response assistant.
 *
 * Tone rules enforced here:
 *  - the helpline is the first thing visible once money may have moved;
 *  - the app never says it contacted a bank, froze funds or filed anything;
 *  - recovery is never promised.
 */
export default function EmergencyPage() {
  const { t, lang } = useI18n();
  const [situation, setSituation] = useState<IncidentSituation | null>(null);
  const playbook = situation ? getPlaybook(situation) : null;

  const helpline = OFFICIAL_RESOURCES.find((r) => r.id === "helpline_1930")!;
  const portal = OFFICIAL_RESOURCES.find((r) => r.id === "cybercrime_portal")!;
  const sanchar = OFFICIAL_RESOURCES.find((r) => r.id === "sanchar_saathi")!;

  const localResources = playbook
    ? resolveResources({
        language: lang,
        intent: playbook.urgency === "critical" ? "financial_loss" : "suspicious_communication",
      })
    : [];

  return (
    <div className="space-y-4">
      <header>
        <Badge tone="high" className="mb-2">
          <Siren className="size-3.5" aria-hidden="true" />
          {t.common.tagline}
        </Badge>
        <h1 className="text-2xl font-bold text-foreground">{t.incident.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.incident.subtitle}</p>
      </header>

      <Alert tone="danger" title={t.incident.callHelpline}>
        <p className="flex flex-wrap items-center gap-2">
          <a
            href="tel:1930"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--risk-high)] px-4 text-base font-bold text-white"
          >
            <Phone className="size-4" aria-hidden="true" />
            1930
          </a>
          <a
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-strong bg-surface px-4 text-sm font-semibold text-foreground"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            {t.incident.openPortal}
          </a>
        </p>
        <p className="mt-2 text-xs">{t.incident.helplineNote}</p>
      </Alert>

      <Alert tone="info">{t.incident.intro}</Alert>

      {!playbook ? (
        <Card>
          <CardHeader
            title={t.incident.question}
            description={t.incident.subtitle}
            icon={<AlertTriangle className="size-5 text-[var(--risk-caution)]" aria-hidden="true" />}
          />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {PLAYBOOKS.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setSituation(option.id)}
                  className={cn(
                    "flex min-h-16 w-full flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
                    option.urgency === "critical"
                      ? "border-[var(--risk-high)]/40 bg-[var(--risk-high-soft)]/40 hover:border-[var(--risk-high)]"
                      : "border-border bg-surface hover:border-primary",
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">
                    {option.label[lang]}
                  </span>
                  <span className="text-xs leading-relaxed text-muted">
                    {option.description[lang]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-foreground">{playbook.label[lang]}</h2>
              <Badge
                tone={playbook.urgency === "critical" ? "high" : playbook.urgency === "high" ? "elevated" : "caution"}
              >
                {playbook.urgency === "critical" ? "Highest urgency" : playbook.urgency === "high" ? "High urgency" : "Moderate"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{playbook.description[lang]}</p>
          </Card>

          <Card>
            <CardHeader
              title={t.incident.doFirst}
              icon={<Siren className="size-5 text-[var(--risk-high)]" aria-hidden="true" />}
            />
            <ol className="mt-3 space-y-3">
              {playbook.immediate[lang].map((step, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--risk-high)] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardHeader
              title={t.incident.within24}
              icon={<Clock className="size-5 text-primary" aria-hidden="true" />}
            />
            <ul className="mt-3 space-y-2.5">
              {playbook.followUp[lang].map((step, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </Card>

          {playbook.accountCompromised ? (
            <Alert tone="danger" title={t.incident.bankNote}>
              {t.safety.passwordStep1} {t.safety.passwordStep2} {t.safety.passwordStep3}
            </Alert>
          ) : (
            <Alert tone="info" title={t.safety.bankTitle}>
              {t.incident.bankNote}
            </Alert>
          )}

          <Card>
            <CardHeader
              title={t.incident.preserveEvidence}
              icon={<FolderOpen className="size-5 text-primary" aria-hidden="true" />}
            />
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              <li>· {t.safety.evidenceStep1}</li>
              <li>· {t.safety.evidenceStep2}</li>
              <li>· {t.safety.evidenceStep3}</li>
              <li>· {t.safety.evidenceStep4}</li>
            </ul>
            <p className="mt-3 text-xs text-muted">{t.incident.preserveNote}</p>
          </Card>

          <Card>
            <CardHeader
              title={t.incident.officialHelp}
              icon={<FileText className="size-5 text-primary" aria-hidden="true" />}
            />
            <ul className="mt-3 space-y-2">
              {playbook.showHelpline ? (
                <ResourceRow
                  href="tel:1930"
                  title={helpline.title[lang]}
                  reason={helpline.reason[lang]}
                  cta={t.incident.callHelpline}
                />
              ) : null}
              {playbook.showSanchar ? (
                <ResourceRow
                  href={sanchar.url}
                  title={sanchar.title[lang]}
                  reason={sanchar.reason[lang]}
                  cta={t.incident.openSanchar}
                  external
                />
              ) : null}
              {localResources
                .filter((resource) => !resource.url.startsWith("tel:"))
                .slice(0, 3)
                .map((resource) => (
                  <ResourceRow
                    key={resource.url}
                    href={resource.url}
                    title={resource.title}
                    reason={resource.reason}
                    cta={t.incident.openPortal}
                    external
                  />
                ))}
            </ul>
          </Card>

          <Alert tone="caution" title={t.incident.noGuarantee}>
            <p>{t.incident.recoveryFraudWarning}</p>
          </Alert>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setSituation(null)}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t.incident.chooseAgain}
            </Button>
            <ButtonLink href="/safety-center" variant="ghost">
              {t.safety.title}
            </ButtonLink>
          </div>
        </>
      )}

      <Alert tone="info" title={t.safety.officialNotice}>
        {t.safety.disclaimer}
      </Alert>
    </div>
  );
}

function ResourceRow({
  href,
  title,
  reason,
  cta,
  external = false,
}: {
  href: string;
  title: string;
  reason: string;
  cta: string;
  external?: boolean;
}) {
  return (
    <li>
      <div className="rounded-xl border border-border bg-surface-muted p-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{reason}</p>
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
        >
          {external ? <ExternalLink className="size-3.5" aria-hidden="true" /> : <Phone className="size-3.5" aria-hidden="true" />}
          {cta}
        </a>
      </div>
    </li>
  );
}
