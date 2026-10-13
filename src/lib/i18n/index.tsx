"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { en, type Dictionary } from "./en";
import { hi } from "./hi";
import type { Language } from "@/lib/types";
import { STORAGE_KEYS, useStoredLanguage, languageStore } from "@/lib/storage/store";

/**
 * Internationalisation.
 *
 * The active language lives in the shared device store and is read with
 * `useSyncExternalStore`, so it is hydration-safe (server snapshot first, real
 * value immediately after) and stays in sync across components and tabs.
 * Changing it also updates `<html lang>`, which matters for correct Devanagari
 * shaping and for screen readers.
 */

export const dictionaries: Record<Language, Dictionary> = { en, hi };
export const DEFAULT_LANGUAGE: Language = "en";

type I18nValue = {
  lang: Language;
  /** The active dictionary. Access with dot notation, e.g. `t.dashboard.title`. */
  t: Dictionary;
  setLanguage: (lang: Language) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useStoredLanguage();

  // Keeps the document language in sync. This writes to an external system and
  // never calls setState, so it cannot cascade renders.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLanguage = useCallback((next: Language) => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (private mode, quota exceeded). The change
      // simply does not persist; it still applies for this session.
    }
    languageStore.emit();
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ lang, t: dictionaries[lang], setLanguage }),
    [lang, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the active dictionary. Must be used inside `<I18nProvider>`. */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <I18nProvider>");
  }
  return ctx;
}

export type { Dictionary };
export { en, hi };
