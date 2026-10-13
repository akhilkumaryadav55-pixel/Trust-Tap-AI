"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  Home,
  Image as ImageIcon,
  LifeBuoy,
  Link2,
  MessageSquareWarning,
  Moon,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  Siren,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCapabilities, usePreferences } from "@/components/providers/app-providers";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/surfaces";
import { ServiceWorkerRegistrar } from "./service-worker";
import type { Language } from "@/lib/types-app";

/**
 * Application shell.
 *
 * Navigation is a single horizontally-scrollable pill row rather than a hidden
 * hamburger menu: on a narrow Android phone every destination stays one tap
 * away, and there is no duplicated mobile/desktop navigation to drift apart.
 */

function useNavLabels() {
  const { t } = useI18n();
  return {
    nav: {
      dashboard: t.nav.dashboard,
      text: t.nav.text,
      screenshot: t.nav.screenshot,
      url: t.nav.url,
      incident: t.nav.incident,
      safety: t.nav.safety,
      learn: t.nav.learn,
      saved: t.nav.saved,
      settings: t.nav.settings,
      privacy: t.nav.privacy,
    },
  };
}

const NAV: Array<{ href: string; key: keyof ReturnType<typeof useNavLabels>["nav"]; icon: typeof Home; accent?: boolean }> = [
  { href: "/", key: "dashboard", icon: Home },
  { href: "/check/text", key: "text", icon: MessageSquareWarning },
  { href: "/check/screenshot", key: "screenshot", icon: ImageIcon },
  { href: "/check/link", key: "url", icon: Link2 },
  { href: "/emergency", key: "incident", icon: Siren, accent: true },
  { href: "/safety-center", key: "safety", icon: LifeBuoy },
  { href: "/learn", key: "learn", icon: BookOpen },
  { href: "/saved", key: "saved", icon: Save },
  { href: "/settings", key: "settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <ServiceWorkerRegistrar />
      <SkipLink />
      <Header />
      <PillNav />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-4 sm:max-w-4xl sm:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
    >
      Skip to main content
    </a>
  );
}

function Header() {
  const { t, lang, setLanguage } = useI18n();
  const { theme, setTheme } = usePreferences();
  const caps = useCapabilities();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg"
          aria-label={`${t.common.appName} home`}
        >
          <span
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <ShieldCheck className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold leading-tight text-foreground">
              {t.common.appName}
            </span>
            <span className="hidden truncate text-xs text-muted sm:block">
              {t.common.tagline}
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1.5">
          <EngineModeBadge mode={caps.mode} />

          {/* Language toggle: a real radio group so it is keyboard operable. */}
          <div
            role="radiogroup"
            aria-label={t.onboarding.languageLabel}
            className="flex items-center rounded-lg border border-border bg-surface p-0.5"
          >
            {(["en", "hi"] as Language[]).map((code) => (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={lang === code}
                onClick={() => setLanguage(code)}
                className={cn(
                  "min-h-8 rounded-md px-2.5 text-xs font-semibold transition-colors",
                  lang === code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                {code === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid size-9 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground"
            aria-label={
              theme === "dark"
                ? t.settings.themeLight
                : t.settings.themeDark
            }
          >
            {theme === "dark" ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function EngineModeBadge({ mode }: { mode: "assisted" | "rules-only" }) {
  const { t } = useI18n();

  return (
    <Badge
      tone={mode === "assisted" ? "primary" : "neutral"}
      className="hidden px-2 py-0.5 text-[11px] sm:inline-flex"
      icon={<Brain className="size-3" aria-hidden="true" />}
    >
      {mode === "assisted" ? t.status.assistedBadge : t.status.rulesOnlyBadge}
    </Badge>
  );
}

function PillNav() {
  const pathname = usePathname();
  const labels = useNavLabels();
  const { t } = useI18n();

  return (
    <nav aria-label={t.nav.menu} className="border-b border-border bg-surface/60">
      <ul className="mx-auto flex w-full max-w-4xl gap-1.5 overflow-x-auto px-4 py-2 sm:px-6">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm",
                  active
                    ? "border-transparent bg-primary text-primary-foreground"
                    : item.accent
                      ? "border-[var(--risk-high)]/40 bg-[var(--risk-high-soft)] text-[var(--risk-high)] hover:opacity-90"
                      : "border-border bg-surface text-muted hover:text-foreground",
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {labels.nav[item.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Footer() {
  const { t } = useI18n();
  const caps = useCapabilities();

  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="mx-auto w-full max-w-4xl space-y-3 px-4 py-6 text-xs text-muted sm:px-6">
        <p className="leading-relaxed">{t.results.disclaimer}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/privacy" className="font-semibold underline underline-offset-2">
            {t.privacy.title}
          </Link>
          <Link href="/safety-center" className="font-semibold underline underline-offset-2">
            {t.safety.title}
          </Link>
          <Link href="/settings" className="font-semibold underline underline-offset-2">
            {t.settings.title}
          </Link>
          <span>
            {caps.cloudPersistence ? t.status.cloudOn : t.status.cloudOff}
            {" · "}
            {caps.urlReputation ? t.settings.configured : t.status.reputationOff}
          </span>
        </div>
        <p>
          {t.common.appName} · {t.common.tagline}
        </p>
      </div>
    </footer>
  );
}
