"use client";

import { useMemo, useState } from "react";
import { Eraser, ShieldAlert, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { contentTypeLabels } from "@/lib/i18n/labels";
import { CONTENT_TYPES, type ContentType, type Language } from "@/lib/types-app";
import { detectAndRedact } from "@/lib/analysis/sensitive";
import { Button, Spinner } from "@/components/ui/button";
import { Alert } from "@/components/ui/surfaces";
import { Field, Select, Textarea } from "@/components/ui/form";
import { useAnalyzer } from "./use-analyzer";
import { cn } from "@/lib/utils/cn";

/**
 * Shared message input.
 *
 * Used by the dashboard quick-check and the full message analyser. Sensitive
 * values are detected *in the browser* as the user types, so the warning appears
 * before submission rather than after the content has left the device. The
 * server redacts independently — this is a courtesy, not the safety mechanism.
 */

export const SENSITIVE_CATEGORY_LABEL_KEYS = {
  otp: "sensitiveCategoryOtp",
  pin: "sensitiveCategoryPin",
  card: "sensitiveCategoryCard",
  password: "sensitiveCategoryPassword",
  government_id: "sensitiveCategoryAadhaar",
} as const;

export function MessageForm({
  variant = "full",
  initialText = "",
  initialContentType = "other",
  onSubmitting,
}: {
  variant?: "full" | "compact";
  initialText?: string;
  initialContentType?: ContentType;
  onSubmitting?: () => void;
}) {
  const { t, lang } = useI18n();
  const { state, analyzeMessage, reset } = useAnalyzer();

  const [text, setText] = useState(initialText);
  const [contentType, setContentType] = useState<ContentType | "">(
    variant === "compact" ? initialContentType : initialContentType,
  );
  const [explainLanguage, setExplainLanguage] = useState<Language>(lang);
  const [touched, setTouched] = useState(false);

  const maxChars = 8000;
  const trimmed = text.trim();
  const tooLong = text.length > maxChars;
  const empty = trimmed.length === 0;

  // Client-side sensitive detection (pure function, shared with the server).
  const sensitive = useMemo(
    () => (trimmed.length > 0 ? detectAndRedact(text) : null),
    [text, trimmed.length],
  );

  const loading = state.status === "loading";
  const serverError = state.status === "error" ? state.error : null;
  const fieldError = serverError?.fields?.text ?? null;

  const validationError = touched && empty ? t.textAnalyzer.emptyError : null;
  const lengthError = touched && tooLong ? t.textAnalyzer.tooLongError : null;
  const errorText = fieldError ?? lengthError ?? validationError;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (empty || tooLong) return;
    onSubmitting?.();
    await analyzeMessage({
      text,
      contentType: contentType === "" ? undefined : contentType,
      language: explainLanguage,
    });
  }

  function handleRemoveSensitive() {
    if (!sensitive) return;
    setText(sensitive.redacted);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label={t.textAnalyzer.textareaLabel}
        htmlFor="trusttap-message"
        required
        error={errorText ?? undefined}
        counter={`${text.length} / ${maxChars} ${t.textAnalyzer.counterLabel}`}
        hint={t.dashboard.quickCheckHint}
      >
        <Textarea
          id="trusttap-message"
          name="message"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t.dashboard.textareaPlaceholder}
          invalid={Boolean(errorText)}
          rows={variant === "compact" ? 4 : 8}
          maxLength={maxChars + 500}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>

      {sensitive?.detected ? (
        <div className="space-y-3">
          <Alert tone="caution" title={t.textAnalyzer.sensitiveWarningTitle}>
            <p>{t.textAnalyzer.sensitiveWarningBody}</p>
            <ul className="mt-2 list-inside list-disc text-xs">
              {sensitive.categories.map((category) => (
                <li key={category}>
                  {t.textAnalyzer[SENSITIVE_CATEGORY_LABEL_KEYS[category]]}
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRemoveSensitive}
              >
                <Eraser className="size-4" aria-hidden="true" />
                {t.textAnalyzer.submitAnyway}
              </Button>
            </div>
          </Alert>
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-3",
          variant === "full" ? "sm:grid-cols-2" : "sm:grid-cols-2",
        )}
      >
        <Field label={t.textAnalyzer.contentTypeLabel} htmlFor="trusttap-content-type">
          <Select
            id="trusttap-content-type"
            value={contentType}
            onChange={(event) => setContentType(event.target.value as ContentType | "")}
          >
            <option value="">{t.textAnalyzer.contentTypeAuto}</option>
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {contentTypeLabels[type].label[lang]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.textAnalyzer.languageLabel} htmlFor="trusttap-language">
          <Select
            id="trusttap-language"
            value={explainLanguage}
            onChange={(event) => setExplainLanguage(event.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </Select>
        </Field>
      </div>

      <Alert tone="info">
        <p className="text-xs leading-relaxed">{t.textAnalyzer.privacySummary}</p>
      </Alert>

      {serverError && !fieldError ? (
        <Alert tone="danger" title={t.common.error}>
          <p>{serverError.message}</p>
          {serverError.kind === "network" ? (
            <p className="mt-1 text-xs">{t.status.apiDownBody}</p>
          ) : null}
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="lg" loading={loading} className="flex-1 sm:flex-none">
          {loading ? t.common.analyzing : t.common.checkForScams}
          {!loading ? <Sparkles className="size-4" aria-hidden="true" /> : null}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => {
            setText("");
            setTouched(false);
            reset();
          }}
          disabled={loading}
        >
          {t.textAnalyzer.clear}
        </Button>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-muted" role="status">
          <Spinner className="size-3.5" />
          {t.common.analyzing}
        </p>
      ) : null}

      {sensitive?.detected ? (
        <p className="flex items-start gap-2 text-xs text-muted">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {t.textAnalyzer.redactedNotice}
        </p>
      ) : null}
    </form>
  );
}
