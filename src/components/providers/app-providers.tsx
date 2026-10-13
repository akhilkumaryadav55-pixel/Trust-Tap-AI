"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { I18nProvider } from "@/lib/i18n";
import { setPreferences as persistPreferences } from "@/lib/storage/local";
import {
  analysisStore,
  preferencesStore,
  useHydrated,
  useStoredAnalyses,
  useStoredPreferences,
} from "@/lib/storage/store";
import type { AnalysisResult, ThemePreference } from "@/lib/types-app";
import { DEFAULT_PREFERENCES, type Preferences } from "@/lib/storage/local";

/**
 * Application-wide client state.
 *
 * Three concerns, deliberately separate:
 *  - Capabilities: what this deployment can actually do (from the server).
 *  - Preferences: theme, history opt-in, onboarding state.
 *  - History: the saved checks on this device.
 *
 * All device state is read through the external store (see
 * `lib/storage/store.ts`), which is hydration-safe: React renders the server
 * snapshot first and the real value immediately afterwards, with no effect and
 * no cascading render.
 */

// --- Capabilities -----------------------------------------------------------

export type Capabilities = {
  ai: boolean;
  aiVision: boolean;
  urlReputation: boolean;
  cloudPersistence: boolean;
  mode: "assisted" | "rules-only";
};

const CapabilitiesContext = createContext<Capabilities>({
  ai: false,
  aiVision: false,
  urlReputation: false,
  cloudPersistence: false,
  mode: "rules-only",
});

export function useCapabilities(): Capabilities {
  return useContext(CapabilitiesContext);
}

// --- Preferences ------------------------------------------------------------

type PreferencesValue = Preferences & {
  /**
   * False during server rendering and the hydration pass. Effects that depend on
   * real device state (such as the first-visit redirect) must wait for it.
   */
  hydrated: boolean;
  setTheme: (theme: ThemePreference) => void;
  setHistoryEnabled: (enabled: boolean) => void;
  setOnboarded: (value: boolean) => void;
};

const PreferencesContext = createContext<PreferencesValue>({
  ...DEFAULT_PREFERENCES,
  hydrated: false,
  setTheme: () => undefined,
  setHistoryEnabled: () => undefined,
  setOnboarded: () => undefined,
});

export function usePreferences(): PreferencesValue {
  return useContext(PreferencesContext);
}

const prefersDarkNow = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: light)").matches === false;

/** Apply a theme preference to <html>, resolving "system". */
export function applyTheme(theme: ThemePreference): void {
  if (typeof document === "undefined") return;
  const dark = theme === "dark" || (theme === "system" && prefersDarkNow());
  document.documentElement.classList.toggle("dark", dark);
}

// --- History ----------------------------------------------------------------

type HistoryValue = {
  items: AnalysisResult[];
  hydrated: boolean;
  save: (result: AnalysisResult) => { ok: boolean; error?: string };
  remove: (id: string) => void;
  removeAll: () => void;
  isSaved: (id: string) => boolean;
};

const HistoryContext = createContext<HistoryValue>({
  items: [],
  hydrated: false,
  save: () => ({ ok: false, error: "Storage is unavailable." }),
  remove: () => undefined,
  removeAll: () => undefined,
  isSaved: () => false,
});

// --- Provider ---------------------------------------------------------------

export function AppProviders({
  children,
  capabilities,
}: {
  children: ReactNode;
  capabilities: Capabilities;
}) {
  return (
    <I18nProvider>
      <CapabilitiesContext.Provider value={capabilities}>
        <PreferencesProvider>
          <HistoryProvider>
            <ThemeEffectBridge>{children}</ThemeEffectBridge>
          </HistoryProvider>
        </PreferencesProvider>
      </CapabilitiesContext.Provider>
    </I18nProvider>
  );
}

function PreferencesProvider({ children }: { children: ReactNode }) {
  const prefs = useStoredPreferences();
  const hydrated = useHydrated();

  const update = useCallback((patch: Partial<Preferences>) => {
    persistPreferences(patch);
    preferencesStore.emit();
  }, []);

  const value = useMemo<PreferencesValue>(
    () => ({
      ...prefs,
      hydrated,
      setTheme: (theme) => {
        applyTheme(theme);
        update({ theme });
      },
      setHistoryEnabled: (historyEnabled) => update({ historyEnabled }),
      setOnboarded: (onboarded) => update({ onboarded }),
    }),
    [prefs, hydrated, update],
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

/** Keeps the <html> class in sync when the theme changes after mount. */
function ThemeEffectBridge({ children }: { children: ReactNode }) {
  const { theme, hydrated } = usePreferences();
  useEffect(() => {
    if (hydrated) applyTheme(theme);
  }, [theme, hydrated]);
  return <>{children}</>;
}

/**
 * Saved checks on this device.
 *
 * Writes go through the store so every reader updates, and history is opt-out:
 * when the user disables saving, `save` refuses and explains why instead of
 * silently discarding.
 */
function HistoryProvider({ children }: { children: ReactNode }) {
  const items = useStoredAnalyses();
  const hydrated = useHydrated();
  const { historyEnabled } = usePreferences();

  const save = useCallback(
    (result: AnalysisResult) => {
      if (!historyEnabled) {
        return {
          ok: false,
          error: "Saving is turned off in Settings, so this result was not stored.",
        };
      }
      return analysisStore.save(result);
    },
    [historyEnabled],
  );

  const remove = useCallback((id: string) => {
    analysisStore.remove(id);
  }, []);

  const removeAll = useCallback(() => {
    analysisStore.removeAll();
  }, []);

  const value = useMemo<HistoryValue>(
    () => ({
      items,
      hydrated,
      save,
      remove,
      removeAll,
      isSaved: (id: string) => items.some((item) => item.id === id),
    }),
    [items, hydrated, save, remove, removeAll],
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory(): HistoryValue {
  return useContext(HistoryContext);
}
