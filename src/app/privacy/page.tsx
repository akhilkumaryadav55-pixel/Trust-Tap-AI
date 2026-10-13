"use client";

import Link from "next/link";
import { Eye, HardDrive, Lock, Server, ShieldAlert, Timer } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCapabilities } from "@/components/providers/app-providers";
import { Card, CardHeader, Alert, Badge } from "@/components/ui/surfaces";

/** Plain-language privacy notice. */
export default function PrivacyPage() {
  const { t } = useI18n();
  const caps = useCapabilities();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t.privacy.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.privacy.subtitle}</p>
      </header>

      <Card>
        <CardHeader
          title={t.privacy.whatWeCollect}
          icon={<Eye className="size-5 text-primary" aria-hidden="true" />}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.privacy.whatWeCollectBody}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t.privacy.whyBody}</p>
      </Card>

      <Card>
        <CardHeader
          title="Where it goes"
          icon={<Server className="size-5 text-primary" aria-hidden="true" />}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.privacy.whereBody}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone={caps.ai ? "primary" : "neutral"}>
            {t.settings.capAi}: {caps.ai ? t.settings.configured : t.settings.notConfigured}
          </Badge>
          <Badge tone={caps.aiVision ? "primary" : "neutral"}>
            {t.settings.capVision}: {caps.aiVision ? t.settings.configured : t.settings.notConfigured}
          </Badge>
          <Badge tone={caps.urlReputation ? "primary" : "neutral"}>
            {t.settings.capReputation}:{" "}
            {caps.urlReputation ? t.settings.configured : t.settings.notConfigured}
          </Badge>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={t.privacy.retentionBody.split(".")[0]}
          icon={<Timer className="size-5 text-primary" aria-hidden="true" />}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.privacy.retentionBody}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t.saved.rawNotStored}</p>
      </Card>

      <Card>
        <CardHeader
          title={t.settings.dataTitle}
          icon={<HardDrive className="size-5 text-primary" aria-hidden="true" />}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.privacy.rightsBody}</p>
        <Link
          href="/settings"
          className="mt-2 inline-block text-sm font-semibold text-primary underline underline-offset-2"
        >
          {t.settings.title}
        </Link>
      </Card>

      <Alert tone="danger" title={t.textAnalyzer.sensitiveWarningTitle}>
        {t.privacy.neverBody}
      </Alert>

      <Card>
        <CardHeader
          title={t.settings.aiLimitationsTitle}
          icon={<ShieldAlert className="size-5 text-muted" aria-hidden="true" />}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.settings.aiLimitationsBody}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t.results.disclaimer}</p>
      </Card>

      <Alert tone="info" title={t.settings.contactTitle}>
        {t.privacy.contactBody}
      </Alert>

      <Card>
        <CardHeader
          title={t.safety.officialNotice}
          icon={<Lock className="size-5 text-muted" aria-hidden="true" />}
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.onboarding.notAffiliated}</p>
      </Card>
    </div>
  );
}
