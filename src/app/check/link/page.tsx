"use client";

import { useMemo, useState } from "react";
import { Link2, ScanSearch, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalyzer } from "@/components/analysis/use-analyzer";
import { Card, CardHeader, Alert, Badge } from "@/components/ui/surfaces";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { analyseUrlStructure } from "@/lib/analysis/url";
import { URL_SIGNAL_TEXT } from "@/lib/analysis/url-signal-i18n";
import { useCapabilities } from "@/components/providers/app-providers";
import type { Language } from "@/lib/types-app";

/**
 * Screen E — URL checker.
 *
 * A live offline preview runs in the browser as the user types (the same
 * analysis module the server uses), so structure findings are visible
 * immediately and no request is needed to see them. The submitted address is
 * never fetched, here or on the server.
 */
export default function LinkCheckPage() {
  const { t, lang } = useI18n();
  const caps = useCapabilities();
  const { state, checkUrl } = useAnalyzer();

  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<Language>(lang);
  const [touched, setTouched] = useState(false);

  const loading = state.status === "loading";
  const serverError = state.status === "error" ? state.error : null;

  const preview = useMemo(() => {
    const trimmed = url.trim();
    if (trimmed.length < 4) return null;
    return analyseUrlStructure(trimmed);
  }, [url]);

  const emptyError = touched && url.trim().length === 0 ? t.url.emptyError : null;
  const invalidError =
    touched && preview !== null && !preview.valid ? t.url.invalidUrl : null;
  const error = serverError?.fields?.url ?? invalidError ?? emptyError;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (url.trim().length === 0 || (preview && !preview.valid)) return;
    await checkUrl({ url, language });
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t.url.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.url.subtitle}</p>
      </header>

      <Alert tone="info" title={t.url.title}>
        {t.url.noAutoFetch}
      </Alert>

      <Card>
        <CardHeader
          title={t.url.label}
          description={t.url.subtitle}
          icon={<Link2 className="size-5 text-primary" aria-hidden="true" />}
        />
        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <Field
            label={t.url.label}
            htmlFor="trusttap-url"
            required
            error={error ?? undefined}
            hint="https://example.com/login"
          >
            <Input
              id="trusttap-url"
              name="url"
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.url.placeholder}
              invalid={Boolean(error)}
            />
          </Field>

          <Field label={t.textAnalyzer.languageLabel} htmlFor="trusttap-url-language">
            <Select
              id="trusttap-url-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </Select>
          </Field>

          {serverError && !serverError.fields?.url ? (
            <Alert tone="danger" title={t.common.error}>
              {serverError.message}
            </Alert>
          ) : null}

          <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
            {loading ? t.common.analyzing : t.url.check}
            {!loading ? <ScanSearch className="size-4" aria-hidden="true" /> : null}
          </Button>
        </form>
      </Card>

      {preview ? (
        <Card>
          <CardHeader
            title={t.url.structureTitle}
            icon={<ShieldAlert className="size-5 text-[var(--risk-caution)]" aria-hidden="true" />}
            action={
              <Badge tone={preview.valid ? "neutral" : "caution"} className="text-[11px]">
                {preview.hostname ?? t.url.invalidUrl}
              </Badge>
            }
          />
          {!preview.valid ? (
            <p className="mt-3 text-sm text-muted">{t.url.invalidUrl}</p>
          ) : preview.signals.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t.url.noSignals}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {preview.signals.map((signal) => {
                const text = URL_SIGNAL_TEXT[signal.id];
                return (
                  <li
                    key={signal.id}
                    className="rounded-xl border border-border bg-surface-muted p-3"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {text ? text.title[lang] : signal.label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {text ? text.explanation[lang] : signal.detail}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          <dl className="mt-3 grid gap-1.5 text-xs text-muted sm:grid-cols-2">
            <div className="flex justify-between gap-2">
              <dt>{t.url.scoreLabel}</dt>
              <dd className="font-semibold text-foreground">{preview.basicScore} / 100</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>{t.settings.capReputation}</dt>
              <dd className="font-semibold text-foreground">
                {caps.urlReputation ? t.settings.configured : t.settings.notConfigured}
              </dd>
            </div>
          </dl>
          {!caps.urlReputation ? (
            <div className="mt-3">
              <Alert tone="caution" title={t.url.basicOnlyTitle}>
                {t.url.basicOnlyBody}
              </Alert>
            </div>
          ) : null}
        </Card>
      ) : null}

      <Alert tone="caution" title={t.url.continueToMessage}>
        {t.onboarding.point2Body}
      </Alert>
    </div>
  );
}
