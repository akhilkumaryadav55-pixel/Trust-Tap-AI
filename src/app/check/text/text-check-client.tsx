"use client";

import { MessageSquareWarning, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { MessageForm } from "@/components/analysis/message-form";
import { Card, CardHeader, Alert } from "@/components/ui/surfaces";
import { PRACTICE_SAMPLES } from "@/lib/content/samples";
import { contentTypeLabels } from "@/lib/i18n/labels";

/**
 * Client half of the message analyser.
 *
 * `key` on the form ties its initial value to the active language, so switching
 * language while a practice example is loaded reloads the example in the new
 * language rather than leaving mixed-language text in the box.
 */
export function TextCheckClient({ isExample }: { isExample: boolean }) {
  const { t, lang } = useI18n();
  const initialText = isExample ? PRACTICE_SAMPLES[lang].text : "";

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t.textAnalyzer.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.textAnalyzer.subtitle}</p>
      </header>

      {isExample ? (
        <Alert tone="info" title={t.onboarding.demoTitle}>
          {t.onboarding.demoBody}
        </Alert>
      ) : null}

      <Card>
        <CardHeader
          title={t.textAnalyzer.textareaLabel}
          description={t.dashboard.quickCheckHint}
          icon={<MessageSquareWarning className="size-5 text-primary" aria-hidden="true" />}
        />
        <div className="mt-4">
          <MessageForm key={lang} variant="full" initialText={initialText} />
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t.privacy.whatWeCollect}
          description={t.privacy.whyBody}
          icon={<ShieldCheck className="size-5 text-muted" aria-hidden="true" />}
        />
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>· {t.privacy.whereBody}</li>
          <li>· {t.privacy.retentionBody}</li>
          <li>· {t.privacy.neverBody}</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.entries(contentTypeLabels).map(([key, value]) => (
            <span
              key={key}
              className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[11px] text-muted"
            >
              {value.label[lang]}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
