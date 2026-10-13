"use client";

import { useRouter } from "next/navigation";
import { ScanSearch } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useHydrated, useStoredLastResult } from "@/lib/storage/store";
import { ResultView } from "@/components/analysis/result-view";
import { Card, EmptyState, Skeleton } from "@/components/ui/surfaces";
import { ButtonLink } from "@/components/ui/button";

/**
 * Screen F — analysis result.
 *
 * The result is read from the device store, so it survives a refresh and is
 * already present on the first client render — no fetch, no effect, no flash.
 */
export default function ResultsPage() {
  const { t } = useI18n();
  const result = useStoredLastResult();
  const hydrated = useHydrated();
  const router = useRouter();

  if (!hydrated) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <span className="sr-only">{t.common.loading}</span>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <Card>
        <EmptyState
          icon={<ScanSearch className="size-7" aria-hidden="true" />}
          title={t.results.notFoundTitle}
          description={t.results.notFoundBody}
          action={<ButtonLink href="/check/text">{t.common.checkForScams}</ButtonLink>}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t.results.title}</h1>
      <ResultView
        result={result}
        onAnalyzeAnother={() => {
          router.push("/check/text");
        }}
      />
    </div>
  );
}
