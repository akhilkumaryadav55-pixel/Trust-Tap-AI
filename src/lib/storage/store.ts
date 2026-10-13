"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_PREFERENCES, type Preferences } from "./defaults";
import {
  listLocalAnalyses,
  saveLocalAnalysis,
  deleteLocalAnalysis,
  deleteAllLocalAnalyses,
  setLastResult as persistLastResult,
} from "./local";
import type { AnalysisResult, Language } from "@/lib/types-app";

/**
 * Browser storage as an external store.
 *
 * localStorage *is* external mutable state, so React's supported way to read it
 * is `useSyncExternalStore`. Doing it this way — instead of a
 * `useEffect(() => setState(read()), [])` pattern — has three concrete benefits:
 *
 *  - no cascading render after mount,
 *  - no hydration mismatch: React uses `getServerSnapshot` during hydration and
 *    then re-renders from the real snapshot,
 *  - every component that reads the same key stays in sync, including across
 *    tabs (the `storage` event).
 *
 * Snapshots are memoised against the raw string so the returned reference is
 * stable between renders, which `useSyncExternalStore` requires.
 */

const EMPTY_ANALYSES: AnalysisResult[] = [];
const STORAGE_KEYS = {
  language: "trusttap.language.v1",
  preferences: "trusttap.preferences.v1",
  analyses: "trusttap.analyses.v1",
  lastResult: "trusttap.lastResult.v1",
} as const;

type Listener = () => void;

class JsonStore<T> {
  private readonly listeners = new Set<Listener>();
  private cached: T;
  private cachedRaw: string | null = null;

  constructor(
    private readonly key: string,
    private readonly fallback: T,
    private readonly parse: (raw: string) => T | null,
    private readonly fallbackIsMutable = false,
  ) {
    this.cached = fallback;
  }

  getSnapshot = (): T => {
    if (typeof window === "undefined") return this.fallback;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(this.key);
    } catch {
      return this.fallback;
    }
    if (raw !== this.cachedRaw) {
      this.cachedRaw = raw;
      const parsed = raw === null ? null : this.parse(raw);
      this.cached = parsed === null ? this.fallback : parsed;
    }
    return this.cached;
  };

  /** Stable value used for server rendering and during hydration. */
  getServerSnapshot = (): T => this.fallback;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === this.key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      this.listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  /** Notify readers after a write performed through `local.ts`. */
  emit = (): void => {
    for (const listener of this.listeners) listener();
  };

  /** Reset the memo so the next read re-parses (used after in-place clears). */
  invalidate = (): void => {
    this.cachedRaw = null;
    this.cached = this.fallback;
  };
}

function safeJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const languageStore = new JsonStore<Language>(
  STORAGE_KEYS.language,
  "en",
  (raw) => {
    // Accept both the JSON-quoted form we write and a bare "en"/"hi" value,
    // so a stored preference from an earlier build is never silently dropped.
    const trimmed = raw.trim();
    if (trimmed === "en" || trimmed === "hi") return trimmed;
    const value = safeJson<string>(raw);
    return value === "en" || value === "hi" ? value : null;
  },
);

export const preferencesStore = new JsonStore<Preferences>(
  STORAGE_KEYS.preferences,
  DEFAULT_PREFERENCES,
  (raw) => {
    const value = safeJson<Partial<Preferences>>(raw);
    if (!value || typeof value !== "object") return null;
    return {
      theme:
        value.theme === "light" || value.theme === "dark" || value.theme === "system"
          ? value.theme
          : DEFAULT_PREFERENCES.theme,
      historyEnabled:
        typeof value.historyEnabled === "boolean"
          ? value.historyEnabled
          : DEFAULT_PREFERENCES.historyEnabled,
      onboarded:
        typeof value.onboarded === "boolean" ? value.onboarded : DEFAULT_PREFERENCES.onboarded,
    };
  },
);

const analysesStore = new JsonStore<AnalysisResult[]>(
  STORAGE_KEYS.analyses,
  EMPTY_ANALYSES,
  (raw) => {
    const value = safeJson<AnalysisResult[]>(raw);
    if (!Array.isArray(value)) return null;
    return value.filter(
      (item) => item && typeof item.id === "string" && typeof item.createdAt === "string",
    );
  },
);

const lastResultStore = new JsonStore<AnalysisResult | null>(
  STORAGE_KEYS.lastResult,
  null,
  (raw) => {
    const value = safeJson<AnalysisResult>(raw);
    return value && typeof value.id === "string" ? value : null;
  },
);

// --- React hooks ------------------------------------------------------------

export function useStoredLanguage(): Language {
  return useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
    languageStore.getServerSnapshot,
  );
}

export function useStoredPreferences(): Preferences {
  return useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.getSnapshot,
    preferencesStore.getServerSnapshot,
  );
}

export function useStoredAnalyses(): AnalysisResult[] {
  return useSyncExternalStore(
    analysesStore.subscribe,
    analysesStore.getSnapshot,
    analysesStore.getServerSnapshot,
  );
}

export function useStoredLastResult(): AnalysisResult | null {
  return useSyncExternalStore(
    lastResultStore.subscribe,
    lastResultStore.getSnapshot,
    lastResultStore.getServerSnapshot,
  );
}

/**
 * False on the server and during the hydration pass; true afterwards.
 *
 * Used to gate anything that must not run against the server snapshot — the
 * first-visit redirect being the important one.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

function subscribeNoop(): () => void {
  return () => undefined;
}

// --- Mutations --------------------------------------------------------------
// Writes go through `local.ts` (the single place that touches localStorage) and
// then notify subscribers here.

export const analysisStore = {
  list: listLocalAnalyses,
  save(result: AnalysisResult) {
    const outcome = saveLocalAnalysis(result);
    if (outcome.ok) analysesStore.emit();
    return outcome;
  },
  remove(id: string) {
    const outcome = deleteLocalAnalysis(id);
    analysesStore.emit();
    return outcome;
  },
  removeAll() {
    const outcome = deleteAllLocalAnalyses();
    analysesStore.invalidate();
    analysesStore.emit();
    return outcome;
  },
};

export const lastResultStoreApi = {
  set(result: AnalysisResult) {
    const outcome = persistLastResult(result);
    if (outcome.ok) lastResultStore.emit();
    return outcome;
  },
  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.lastResult);
    } catch {
      // Nothing to do; readers will simply see no result.
    }
    lastResultStore.invalidate();
    lastResultStore.emit();
  },
};

export { STORAGE_KEYS, DEFAULT_PREFERENCES };
export type { Preferences };
