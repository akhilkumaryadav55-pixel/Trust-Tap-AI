"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Cloud,
  Download,
  Eye,
  Globe,
  Info,
  Mail,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCapabilities, useHistory, usePreferences } from "@/components/providers/app-providers";
import { Card, CardHeader, Alert, Badge } from "@/components/ui/surfaces";
import { Button } from "@/components/ui/button";
import { exportLocalData } from "@/lib/storage/local";
import type { Language, ThemePreference } from "@/lib/types-app";
import { cn } from "@/lib/utils/cn";

/**
 * Screen K — settings and privacy.
 *
 * No account is required or offered here: every safety feature works without
 * one. When cloud storage is configured but unused (no signed-in account), the
 * card says exactly that rather than implying data is syncing.
 */
export default function SettingsPage() {
  const { t, lang, setLanguage } = useI18n();
  const {
    theme,
    setTheme,
    historyEnabled,
    setHistoryEnabled,
    setOnboarded,
  } = usePreferences();
  const history = useHistory();
  const caps = useCapabilities();
  const [status, setStatus] = useState<string | null>(null);

  function handleExport() {
    const blob = new Blob([exportLocalData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `trusttap-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus(t.settings.exportDone);
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t.settings.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.settings.subtitle}</p>
      </header>

      {/* --- Language -------------------------------------------------------- */}
      <Card>
        <CardHeader
          title={t.settings.language}
          description={t.settings.languageHint}
          icon={<Globe className="size-5 text-primary" aria-hidden="true" />}
        />
        <fieldset className="mt-3">
          <legend className="sr-only">{t.settings.language}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["en", "hi"] as Language[]).map((code) => (
              <label
                key={code}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition-colors",
                  lang === code
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-muted",
                )}
              >
                <input
                  type="radio"
                  name="settings-language"
                  value={code}
                  checked={lang === code}
                  onChange={() => setLanguage(code)}
                  className="sr-only"
                />
                {code === "en" ? "English" : "हिन्दी"}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      {/* --- Theme ----------------------------------------------------------- */}
      <Card>
        <CardHeader
          title={t.settings.theme}
          icon={<Eye className="size-5 text-primary" aria-hidden="true" />}
        />
        <fieldset className="mt-3">
          <legend className="sr-only">{t.settings.theme}</legend>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["light", t.settings.themeLight],
                ["dark", t.settings.themeDark],
                ["system", t.settings.themeSystem],
              ] as Array<[ThemePreference, string]>
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-xs font-semibold transition-colors sm:text-sm",
                  theme === value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-muted",
                )}
              >
                <input
                  type="radio"
                  name="settings-theme"
                  value={value}
                  checked={theme === value}
                  onChange={() => setTheme(value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      {/* --- History --------------------------------------------------------- */}
      <Card>
        <CardHeader
          title={t.settings.history}
          description={historyEnabled ? t.settings.historyOnHint : t.settings.historyOffHint}
          icon={<ShieldCheck className="size-5 text-primary" aria-hidden="true" />}
          action={
            <Badge tone={historyEnabled ? "none" : "neutral"}>
              {historyEnabled ? t.common.on : t.common.off}
            </Badge>
          }
        />
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={historyEnabled}
            onChange={(event) => setHistoryEnabled(event.target.checked)}
            className="size-5 accent-[var(--primary)]"
          />
          <span className="text-sm text-foreground">
            {historyEnabled ? t.settings.historyOnHint : t.settings.historyOffHint}
          </span>
        </label>
      </Card>

      {/* --- Data ------------------------------------------------------------ */}
      <Card>
        <CardHeader
          title={t.settings.dataTitle}
          description={t.saved.rawNotStored}
          icon={<Trash2 className="size-5 text-primary" aria-hidden="true" />}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={handleExport}>
            <Download className="size-4" aria-hidden="true" />
            {t.settings.exportData}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={history.items.length === 0}
            onClick={() => {
              history.removeAll();
              setStatus(t.saved.deleted);
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t.settings.deleteLocalHistory}
          </Button>
        </div>
        {status ? (
          <p className="mt-2 text-xs text-muted" role="status">
            {status}
          </p>
        ) : null}
      </Card>

      {/* --- Cloud ----------------------------------------------------------- */}
      <Card>
        <CardHeader
          title={t.settings.capCloud}
          icon={<Cloud className="size-5 text-primary" aria-hidden="true" />}
          action={
            <Badge tone={caps.cloudPersistence ? "primary" : "neutral"}>
              {caps.cloudPersistence ? t.settings.configured : t.settings.notConfigured}
            </Badge>
          }
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {caps.cloudPersistence ? t.saved.cloudModeNotice : t.saved.localModeNotice}
        </p>
        <div className="mt-3">
          <Button
            type="button"
            variant="ghost"
            disabled={!caps.cloudPersistence}
            title={t.settings.deleteCloudUnavailable}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t.settings.deleteCloudData}
          </Button>
          {!caps.cloudPersistence ? (
            <p className="mt-2 text-xs text-muted">{t.settings.deleteCloudUnavailable}</p>
          ) : null}
        </div>
      </Card>

      {/* --- Engine status --------------------------------------------------- */}
      <Card>
        <CardHeader
          title={t.settings.engineTitle}
          icon={<Brain className="size-5 text-primary" aria-hidden="true" />}
        />
        <dl className="mt-3 space-y-2 text-sm">
          <Row label={t.settings.engineMode}>
            {caps.mode === "assisted" ? t.settings.modeAssisted : t.settings.modeRulesOnly}
          </Row>
          <Row label={t.settings.capAi}>
            {caps.ai ? t.settings.configured : t.settings.notConfigured}
          </Row>
          <Row label={t.settings.capVision}>
            {caps.aiVision ? t.settings.configured : t.settings.notConfigured}
          </Row>
          <Row label={t.settings.capReputation}>
            {caps.urlReputation ? t.settings.configured : t.settings.notConfigured}
          </Row>
          <Row label={t.settings.capCloud}>
            {caps.cloudPersistence ? t.settings.configured : t.settings.notConfigured}
          </Row>
        </dl>
      </Card>

      {/* --- Privacy and limitations ---------------------------------------- */}
      <Card>
        <CardHeader
          title={t.settings.privacyTitle}
          icon={<ShieldCheck className="size-5 text-muted" aria-hidden="true" />}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.settings.privacyBody}</p>
        <Link
          href="/privacy"
          className="mt-2 inline-block text-sm font-semibold text-primary underline underline-offset-2"
        >
          {t.privacy.title}
        </Link>
      </Card>

      <Card>
        <CardHeader
          title={t.settings.aiLimitationsTitle}
          icon={<Info className="size-5 text-muted" aria-hidden="true" />}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.settings.aiLimitationsBody}</p>
      </Card>

      {/* --- Contact --------------------------------------------------------- */}
      <Card>
        <CardHeader
          title={t.settings.contactTitle}
          icon={<Mail className="size-5 text-primary" aria-hidden="true" />}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.settings.contactBody}</p>
        <a
          href="mailto:feedback@trusttap.example?subject=TrustTap%20AI%20feedback"
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-strong bg-surface px-4 text-sm font-semibold text-foreground"
        >
          <Mail className="size-4" aria-hidden="true" />
          {t.settings.contactCta}
        </a>
        <p className="mt-2 text-xs text-muted">
          Configure a real contact address before deploying.
        </p>
      </Card>

      {/* --- About ----------------------------------------------------------- */}
      <Card>
        <CardHeader
          title={t.settings.aboutTitle}
          description={`${t.common.tagline} · ${t.settings.versionLabel} 1.0.0`}
          icon={<Info className="size-5 text-muted" aria-hidden="true" />}
        />
        <div className="mt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setOnboarded(false);
              setStatus(t.settings.resetOnboardingDone);
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t.settings.resetOnboarding}
          </Button>
        </div>
      </Card>

      <Alert tone="info" title={t.onboarding.notAffiliated}>
        {t.results.disclaimer}
      </Alert>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{children}</dd>
    </div>
  );
}
