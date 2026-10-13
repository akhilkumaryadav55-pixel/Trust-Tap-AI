import type { ThemePreference } from "@/lib/types-app";

/**
 * Preference defaults.
 *
 * Kept in a server-safe module (no "use client", no browser API) because the
 * root layout's pre-paint script needs the default theme, and `local.ts` — which
 * is browser-only — must not be imported into a server component.
 */
export type Preferences = {
  theme: ThemePreference;
  historyEnabled: boolean;
  onboarded: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "dark",
  historyEnabled: true,
  onboarded: false,
};
