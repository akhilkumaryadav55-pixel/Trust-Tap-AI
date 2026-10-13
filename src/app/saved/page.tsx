"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Info, Save, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useHistory, usePreferences, useCapabilities } from "@/components/providers/app-providers";
import { Card, CardHeader, Alert, EmptyState, Badge } from "@/components/ui/surfaces";
import { Button, ButtonLink } from "@/components/ui/button";
import { RiskBadge } from "@/components/ui/risk";
import { formatDateTime } from "@/components/analysis/result-view";
import { contentTypeLabels } from "@/lib/i18n/labels";
import { exportLocalData } from "@/lib/storage/local";
import { lastResultStoreApi } from "@/lib/storage/store";

/**
 * Screen J — saved checks.
 *
 * Deleting is deliberately easy and per-item as well as bulk. A user who regrets
 * saving a sensitive message can remove it in one tap, and the raw message text
 * was never stored in the first place.
 */
export default function SavedPage() {
  const { t, lang } = useI18n();
  const history = useHistory();
  const { historyEnabled, setHistoryEnabled } = usePreferences();
  const caps = useCapabilities();
  const router = useRouter();
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function handleExport() {
    const json = exportLocalData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `trusttap-saved-checks-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus(t.settings.exportDone);
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t.saved.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.saved.subtitle}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone={caps.cloudPersistence ? "primary" : "neutral"}>
            {caps.cloudPersistence ? t.status.cloudOn : t.status.cloudOff}
          </Badge>
          <Badge tone="neutral">
            {history.items.length} {t.saved.count}
          </Badge>
        </div>
      </header>

      <Alert tone="info" title={t.saved.rawNotStored}>
        {caps.cloudPersistence ? t.saved.cloudModeNotice : t.saved.localModeNotice}
      </Alert>

      {!historyEnabled ? (
        <Alert tone="caution" title={t.saved.historyDisabledTitle}>
          <p>{t.saved.historyDisabledBody}</p>
          <div className="mt-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setHistoryEnabled(true)}>
              {t.saved.enableHistory}
            </Button>
          </div>
        </Alert>
      ) : null}

      {history.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Save className="size-7" aria-hidden="true" />}
            title={t.saved.empty}
            description={t.saved.emptyBody}
            action={<ButtonLink href="/check/text">{t.common.checkForScams}</ButtonLink>}
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {history.items.map((item) => (
            <li key={item.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <RiskBadge level={item.riskLevel} size="sm" />
                      <Badge tone="neutral" className="text-[11px]">
                        {contentTypeLabels[item.contentType].label[lang]}
                      </Badge>
                      <span className="text-xs text-muted">
                        {formatDateTime(item.createdAt, lang)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground">
                      {item.summary}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {t.results.indicativeScore}: {item.riskScore} / 100 ·{" "}
                      {item.meta.sensitiveInputDetected
                        ? t.textAnalyzer.redactedNotice
                        : t.saved.rawNotStored}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        lastResultStoreApi.set(item);
                        router.push("/results");
                      }}
                    >
                      {t.saved.openResult}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`${t.saved.delete}: ${item.summary.slice(0, 40)}`}
                      onClick={() => {
                        history.remove(item.id);
                        setStatus(t.saved.deleted);
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card>
        <CardHeader
          title={t.settings.dataTitle}
          description={t.saved.rawNotStored}
          icon={<Info className="size-5 text-muted" aria-hidden="true" />}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={handleExport}>
            <Download className="size-4" aria-hidden="true" />
            {t.settings.exportData}
          </Button>
          {!confirmingDeleteAll ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmingDeleteAll(true)}
              disabled={history.items.length === 0}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t.saved.deleteAll}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  history.removeAll();
                  setConfirmingDeleteAll(false);
                  setStatus(t.saved.deleted);
                }}
              >
                {t.saved.confirmDeleteAll}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setConfirmingDeleteAll(false)}>
                {t.common.cancel}
              </Button>
            </>
          )}
        </div>
        {status ? (
          <p className="mt-2 text-xs text-muted" role="status">
            {status}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
