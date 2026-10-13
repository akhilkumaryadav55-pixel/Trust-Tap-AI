"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Link2, MessageSquareWarning, ShieldQuestion } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { usePreferences } from "@/components/providers/app-providers";
import { Card, Alert, Badge } from "@/components/ui/surfaces";
import { Button } from "@/components/ui/button";
import { PRACTICE_SAMPLES, SAMPLE_HASH } from "@/lib/content/samples";
import type { Language } from "@/lib/types-app";
import { cn } from "@/lib/utils/cn";

/**
 * Screen A — welcome and onboarding.
 *
 * No account, no wall. "Get Started" is available immediately, and the practice
 * example exists so someone can see real output without pasting their own
 * private message first.
 */

export default function WelcomePage() {
  const { t, lang, setLanguage } = useI18n();
  const { setOnboarded } = usePreferences();
  const router = useRouter();

  /**
   * Onboarding never blocks a check: both paths leave the user able to act
   * immediately, and "try the example" goes straight into the analyser with the
   * fictional sample already loaded.
   */
  function start(withPractice: boolean) {
    setOnboarded(true);
    router.push(withPractice ? `/check/text${SAMPLE_HASH}` : "/");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <Badge tone="primary" className="mb-3">
          {t.common.tagline}
        </Badge>
        <h1 className="text-balance text-2xl font-bold leading-snug text-foreground sm:text-3xl">
          {t.onboarding.title}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted sm:text-base">
          {t.onboarding.subtitle}
        </p>

        <ul className="mt-5 space-y-3">
          <Point
            icon={<MessageSquareWarning className="size-5" aria-hidden="true" />}
            title={t.onboarding.point1Title}
            body={t.onboarding.point1Body}
          />
          <Point
            icon={<ShieldQuestion className="size-5" aria-hidden="true" />}
            title={t.onboarding.point2Title}
            body={t.onboarding.point2Body}
          />
          <Point
            icon={<Link2 className="size-5" aria-hidden="true" />}
            title={t.onboarding.point3Title}
            body={t.onboarding.point3Body}
          />
        </ul>
      </section>

      <Card>
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            {t.onboarding.languageLabel}
          </legend>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {(["en", "hi"] as Language[]).map((code) => (
              <label
                key={code}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition-colors",
                  lang === code
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-muted",
                )}
              >
                <input
                  type="radio"
                  name="language"
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

      <Alert tone="info" title={t.onboarding.privacyTitle}>
        {t.onboarding.privacyBody}
      </Alert>

      <Card>
        <h2 className="text-sm font-semibold text-foreground">{t.onboarding.demoTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.onboarding.demoBody}</p>
        <div className="mt-3 rounded-xl border border-dashed border-border-strong bg-surface-muted p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t.common.sample}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground">
            {PRACTICE_SAMPLES[lang].text}
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" onClick={() => start(false)} className="flex-1">
          {t.onboarding.getStarted}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <Button size="lg" variant="secondary" onClick={() => start(true)} className="flex-1">
          {t.onboarding.tryDemo}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => start(false)}
        className="mx-auto block min-h-10 text-sm font-semibold text-muted underline underline-offset-2"
      >
        {t.onboarding.skipToDashboard}
      </button>

      <p className="text-center text-xs text-muted">{t.onboarding.notAffiliated}</p>
    </div>
  );
}

function Point({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <span
        className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-muted">{body}</span>
      </span>
    </li>
  );
}
