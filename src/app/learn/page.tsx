"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LEARNING_TOPICS } from "@/lib/content/learning";
import { Alert, Badge } from "@/components/ui/surfaces";

/** Screen I — Learning Center index. */
export default function LearnPage() {
  const { t, lang } = useI18n();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t.learn.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.learn.subtitle}</p>
        <div className="mt-2">
          <Badge tone="neutral">
            <BookOpen className="size-3" aria-hidden="true" />
            {LEARNING_TOPICS.length} {t.learn.topicsLabel}
          </Badge>
        </div>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {LEARNING_TOPICS.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={`/learn/${topic.slug}`}
              className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary"
            >
              <h2 className="text-sm font-bold text-foreground">{topic.title[lang]}</h2>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted">
                {topic.summary[lang]}
              </p>
              <p className="mt-3 flex items-center justify-between text-[11px] font-semibold text-primary">
                <span className="inline-flex items-center gap-1 text-muted">
                  <Clock className="size-3" aria-hidden="true" />
                  {topic.minutes} {t.learn.minutes}
                </span>
                {t.learn.readLesson}
                <ArrowRight className="size-3" aria-hidden="true" />
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <Alert tone="info" title={t.learn.exampleNotice}>
        {t.onboarding.notAffiliated} {t.results.disclaimer}
      </Alert>
    </div>
  );
}
