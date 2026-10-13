import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/shell/app-shell";
import { getPublicCapabilities, serverEnv } from "@/lib/env";
import { DEFAULT_PREFERENCES } from "@/lib/storage/defaults";

/**
 * Root layout.
 *
 * Fonts: Inter for Latin and Noto Sans Devanagari for Hindi. The Devanagari
 * face matters — without it, Hindi copy falls back to a system font that may be
 * missing or badly hinted on Android.
 *
 * The inline theme script runs before first paint so a dark-mode user never
 * sees a white flash. It only reads a local preference; it contains no user data.
 */

const inter = Inter({
  variable: "--font-app-sans",
  subsets: ["latin"],
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-app-devanagari",
  subsets: ["devanagari", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "TrustTap AI",
  title: {
    default: "TrustTap AI — Pause. Check. Protect.",
    template: "%s · TrustTap AI",
  },
  description:
    "Check suspicious messages, screenshots and links for scam indicators. Plain-language explanations, official Indian helplines, and honest limits. An awareness tool, not a bank or government service.",
  metadataBase: new URL(serverEnv.appUrl),
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  openGraph: {
    title: "TrustTap AI — Pause. Check. Protect.",
    description:
      "Understand scam warning signs in a message, screenshot or link before you act.",
    type: "website",
    locale: "en_IN",
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060b18" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7fc" },
  ],
};

/** Runs before paint: applies the saved theme and language. */
const bootstrapScript = `
(function () {
  try {
    var raw = localStorage.getItem('trusttap.preferences.v1');
    var prefs = raw ? JSON.parse(raw) : {};
    var theme = prefs.theme || '${DEFAULT_PREFERENCES.theme}';
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    var dark = theme === 'dark' || (theme === 'system' && !prefersLight);
    document.documentElement.classList.toggle('dark', dark);
    var rawLang = localStorage.getItem('trusttap.language.v1');
    var lang = null;
    try { lang = rawLang === null ? null : JSON.parse(rawLang); } catch (err) { lang = rawLang; }
    if (lang === 'hi' || lang === 'en') document.documentElement.lang = lang;
  } catch (e) {}
})();
`.trim();

export default function RootLayout({ children }: LayoutProps<"/">) {
  const capabilities = getPublicCapabilities();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${devanagari.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      </head>
      <body className="min-h-full antialiased">
        <AppProviders
          capabilities={{
            ai: capabilities.ai,
            aiVision: capabilities.aiVision,
            urlReputation: capabilities.urlReputation,
            cloudPersistence: capabilities.cloudPersistence,
            mode: capabilities.mode,
          }}
        >
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
