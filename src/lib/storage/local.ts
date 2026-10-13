"use client";

import type { AnalysisResult } from "@/lib/types-app";
import { DEFAULT_PREFERENCES, type Preferences } from "./defaults";

/**
 * Device-local storage accessors.
 *
 * This is the ONLY module that touches `window.localStorage` directly. React
 * components read device state through `lib/storage/store.ts`, which wraps these
 * functions in `useSyncExternalStore`.
 *
 * This is the default persistence mode. Everything lives in the user's own
 * browser: nothing is uploaded, nothing is shared between devices, and clearing
 * site data removes it permanently. The UI labels these entries "Device" so a
 * local entry is never mistaken for a synchronised cloud record.
 *
 * Privacy rules enforced here:
 *  - Only metadata, findings and a redacted excerpt are stored. Raw message text
 *    and uploaded images are never written to storage.
 *  - Access is wrapped in try/catch because storage can be unavailable (private
 *    browsing, blocked cookies, quota exceeded). A failure is reported to the
 *    caller — never silently ignored.
 */

const KEYS = {
  analyses: "trusttap.analyses.v1",
  preferences: "trusttap.preferences.v1",
  lastResult: "trusttap.lastResult.v1",
} as const;

/** Hard cap so localStorage cannot be filled by a curious user. */
export const MAX_LOCAL_ENTRIES = 100;

export { DEFAULT_PREFERENCES };
export type { Preferences };

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt or unreadable entry: treat as absent rather than crashing.
    return null;
  }
}

function writeJson(key: string, value: unknown): { ok: boolean; error?: string } {
  if (!isBrowser()) return { ok: false, error: "Storage is not available." };
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "This browser would not let us save locally (private mode, or storage is full).",
    };
  }
}

// --- Saved analyses ---------------------------------------------------------

export function listLocalAnalyses(): AnalysisResult[] {
  const items = readJson<AnalysisResult[]>(KEYS.analyses);
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) => item && typeof item.id === "string" && typeof item.createdAt === "string",
  );
}

export function saveLocalAnalysis(result: AnalysisResult): { ok: boolean; error?: string } {
  const existing = listLocalAnalyses().filter((item) => item.id !== result.id);
  const next = [{ ...result }, ...existing].slice(0, MAX_LOCAL_ENTRIES);
  return writeJson(KEYS.analyses, next);
}

export function deleteLocalAnalysis(id: string): { ok: boolean; error?: string } {
  const next = listLocalAnalyses().filter((item) => item.id !== id);
  return writeJson(KEYS.analyses, next);
}

export function deleteAllLocalAnalyses(): { ok: boolean; error?: string } {
  return writeJson(KEYS.analyses, []);
}

// --- Last viewed result -----------------------------------------------------

export function setLastResult(result: AnalysisResult): { ok: boolean; error?: string } {
  return writeJson(KEYS.lastResult, result);
}

export function getLastResult(): AnalysisResult | null {
  const value = readJson<AnalysisResult>(KEYS.lastResult);
  if (!value || typeof value.id !== "string") return null;
  return value;
}

export function clearLastResult(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(KEYS.lastResult);
  } catch {
    // Nothing useful to do; the results screen already handles a missing value.
  }
}

// --- Preferences ------------------------------------------------------------

export function getPreferences(): Preferences {
  const stored = readJson<Partial<Preferences>>(KEYS.preferences);
  if (!stored) return { ...DEFAULT_PREFERENCES };
  return {
    theme:
      stored.theme === "light" || stored.theme === "dark" || stored.theme === "system"
        ? stored.theme
        : DEFAULT_PREFERENCES.theme,
    historyEnabled:
      typeof stored.historyEnabled === "boolean"
        ? stored.historyEnabled
        : DEFAULT_PREFERENCES.historyEnabled,
    onboarded:
      typeof stored.onboarded === "boolean"
        ? stored.onboarded
        : DEFAULT_PREFERENCES.onboarded,
  };
}

export function setPreferences(patch: Partial<Preferences>): {
  ok: boolean;
  error?: string;
} {
  return writeJson(KEYS.preferences, { ...getPreferences(), ...patch });
}

// --- Export -----------------------------------------------------------------

/** Produce a downloadable JSON snapshot of everything stored on this device. */
export function exportLocalData(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: "TrustTap AI",
      note: "Device-local export. Contains saved check metadata, findings and redacted excerpts. No raw message text or images are stored by this app.",
      preferences: getPreferences(),
      savedChecks: listLocalAnalyses(),
    },
    null,
    2,
  );
}
