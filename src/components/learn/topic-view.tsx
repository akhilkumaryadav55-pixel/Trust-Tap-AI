"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { LearningTopic } from "@/lib/content/learning";
import { Card, CardHeader, Alert, Badge } from "@/components/ui/surfaces";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * Lesson + quiz.
 *
 * Quiz answers are held in component state only: nothing is stored, nothing is
 * sent anywhere, and there is no score to be discouraged by. That is stated in
 * the UI so the user knows.
 */
export function TopicView({ topic }: { topic: LearningTopic }) {
  const { t, lang } = useI18n();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const correctCount = useMemo(
    () =>
      topic.quiz.reduce(
        (sum, question, index) =>
          checked[index] && answers[index] === question.correctIndex ? sum + 1 : sum,
        0,
      ),
    [answers, checked, topic.quiz],
  );

  const checkedCount = Object.values(checked).filter(Boolean).length;

  function resetQuiz() {
    setAnswers({});
    setChecked({});
  }

  return (
    <div className="space-y-4">
      <Link
        href="/learn"
        className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-muted underline underline-offset-2"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {t.learn.backToTopics}
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">{topic.title[lang]}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{topic.summary[lang]}</p>
        <div className="mt-2">
          <Badge tone="neutral">
            <Clock className="size-3" aria-hidden="true" />
            {topic.minutes} {t.learn.minutes}
          </Badge>
        </div>
      </header>

      <Card>
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          {topic.explanation[lang].map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Card>

      {/* Educational example — always labelled as fictional. */}
      <Card className="border-dashed">
        <CardHeader
          title={t.learn.exampleTitle}
          description={t.learn.exampleNotice}
          icon={<AlertTriangle className="size-5 text-[var(--risk-caution)]" aria-hidden="true" />}
        />
        <blockquote className="mt-3 rounded-xl border border-border bg-surface-muted p-3 text-sm italic leading-relaxed text-foreground">
          {topic.example[lang]}
        </blockquote>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={t.learn.warningSignsTitle}
            icon={<AlertTriangle className="size-5 text-[var(--risk-caution)]" aria-hidden="true" />}
          />
          <ul className="mt-3 space-y-2">
            {topic.warningSigns[lang].map((sign, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--risk-caution)]"
                  aria-hidden="true"
                />
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title={t.learn.saferActionsTitle}
            icon={<ShieldCheck className="size-5 text-[var(--risk-none)]" aria-hidden="true" />}
          />
          <ul className="mt-3 space-y-2">
            {topic.saferActions[lang].map((action, index) => (
              <li key={index} className="flex gap-2.5 text-sm leading-relaxed">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-[var(--risk-none)]"
                  aria-hidden="true"
                />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* --- Quiz ------------------------------------------------------------ */}
      <Card>
        <CardHeader
          title={t.learn.quizTitle}
          description={t.learn.quizIntro}
          icon={<CheckCircle2 className="size-5 text-primary" aria-hidden="true" />}
          action={
            checkedCount > 0 ? (
              <Badge tone={correctCount === topic.quiz.length ? "none" : "neutral"}>
                {t.learn.quizScoreLabel} {correctCount} / {topic.quiz.length}
              </Badge>
            ) : null
          }
        />

        <ol className="mt-4 space-y-5">
          {topic.quiz.map((question, questionIndex) => {
            const isChecked = Boolean(checked[questionIndex]);
            const chosen = answers[questionIndex];
            const isCorrect = chosen === question.correctIndex;

            return (
              <li key={questionIndex}>
                <fieldset>
                  <legend className="text-sm font-semibold text-foreground">
                    {t.common.question} {questionIndex + 1}. {question.question[lang]}
                  </legend>
                  <div className="mt-2.5 space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const selected = chosen === optionIndex;
                      const revealCorrect = isChecked && optionIndex === question.correctIndex;
                      const revealWrong = isChecked && selected && !isCorrect;

                      return (
                        <label
                          key={optionIndex}
                          className={cn(
                            "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors",
                            revealCorrect
                              ? "border-[var(--risk-none)] bg-[var(--risk-none-soft)]"
                              : revealWrong
                                ? "border-[var(--risk-high)] bg-[var(--risk-high-soft)]"
                                : selected
                                  ? "border-primary bg-primary-soft"
                                  : "border-border bg-surface hover:border-border-strong",
                          )}
                        >
                          <input
                            type="radio"
                            name={`quiz-${questionIndex}`}
                            checked={selected}
                            onChange={() =>
                              setAnswers((current) => ({
                                ...current,
                                [questionIndex]: optionIndex,
                              }))
                            }
                            className="size-4 accent-[var(--primary)]"
                          />
                          <span className="flex-1">{option[lang]}</span>
                          {revealCorrect ? (
                            <CheckCircle2
                              className="size-4 shrink-0 text-[var(--risk-none)]"
                              aria-hidden="true"
                            />
                          ) : null}
                          {revealWrong ? (
                            <XCircle
                              className="size-4 shrink-0 text-[var(--risk-high)]"
                              aria-hidden="true"
                            />
                          ) : null}
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3">
                    {!isChecked ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={chosen === undefined}
                        onClick={() =>
                          setChecked((current) => ({ ...current, [questionIndex]: true }))
                        }
                      >
                        {t.learn.quizSubmit}
                      </Button>
                    ) : (
                      <div
                        role="status"
                        className={cn(
                          "rounded-xl border p-3 text-sm leading-relaxed",
                          isCorrect
                            ? "border-[var(--risk-none)]/40 bg-[var(--risk-none-soft)]"
                            : "border-[var(--risk-caution)]/40 bg-[var(--risk-caution-soft)]",
                        )}
                      >
                        <p className="font-semibold">
                          {isCorrect ? t.learn.quizCorrect : t.learn.quizIncorrect}
                        </p>
                        <p className="mt-1 text-muted">{question.explanation[lang]}</p>
                      </div>
                    )}
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ol>

        {checkedCount === topic.quiz.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-foreground">
              {t.learn.quizComplete} — {t.learn.quizScoreLabel} {correctCount} /{" "}
              {topic.quiz.length}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={resetQuiz}>
              {t.learn.quizAgain}
            </Button>
          </div>
        ) : null}
      </Card>

      <Alert tone="info" title={t.learn.exampleNotice}>
        {t.results.disclaimer}
      </Alert>
    </div>
  );
}
