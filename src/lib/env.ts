/**
 * Server-side environment access.
 *
 * IMPORTANT: this module is server-only. It must never be imported from a
 * component marked `"use client"` — doing so would leak provider credentials
 * into the browser bundle. Only `publicEnv` (explicitly NEXT_PUBLIC_*) is
 * below, and it is also read from the client via `NEXT_PUBLIC_*` inlining.
 *
 * Capability flags (`capabilities`) are derived from which secrets are
 * present. The UI uses them to say exactly what did and did not run, instead
 * of implying a check happened when it did not.
 */

function str(name: string): string {
  return (process.env[name] ?? "").trim();
}

function num(name: string, fallback: number): number {
  const raw = str(name);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function bool(name: string, fallback = false): boolean {
  const raw = str(name).toLowerCase();
  if (!raw) return fallback;
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

export const serverEnv = {
  get aiApiKey() {
    return str("AI_API_KEY");
  },
  get aiBaseUrl() {
    return str("AI_BASE_URL") || "https://api.openai.com/v1";
  },
  get aiModel() {
    return str("AI_MODEL") || "gpt-4o-mini";
  },
  get aiVisionModel() {
    return str("AI_VISION_MODEL");
  },
  get aiTimeoutMs() {
    return num("AI_TIMEOUT_MS", 20_000);
  },
  get safeBrowsingApiKey() {
    return str("SAFE_BROWSING_API_KEY");
  },
  get supabaseUrl() {
    return str("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return str("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return str("SUPABASE_SERVICE_ROLE_KEY");
  },
  get rateLimitPerMinute() {
    return num("RATE_LIMIT_PER_MINUTE", 30);
  },
  get maxMessageChars() {
    return num("MAX_MESSAGE_CHARS", 8_000);
  },
  get maxUploadBytes() {
    return num("MAX_UPLOAD_BYTES", 5 * 1024 * 1024);
  },
  get appUrl() {
    return str("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get forceAiDisabled() {
    return bool("DISABLE_AI", false);
  },
} as const;

/**
 * Which optional capabilities are actually available in this deployment.
 * Derived purely from configuration — never guessed, never faked.
 */
export type Capabilities = {
  /** A server-side AI provider is configured and enabled. */
  ai: boolean;
  /** A vision-capable model is configured for screenshot OCR. */
  aiVision: boolean;
  /** Google Safe Browsing credentials are present. */
  urlReputation: boolean;
  /** Supabase is configured for cloud persistence. */
  cloudPersistence: boolean;
  /** Authentication can be offered (requires Supabase). */
  accounts: boolean;
};

export function getCapabilities(): Capabilities {
  const ai = Boolean(serverEnv.aiApiKey) && !serverEnv.forceAiDisabled;
  const supabase = Boolean(serverEnv.supabaseUrl && serverEnv.supabaseAnonKey);
  return {
    ai,
    aiVision: ai && Boolean(serverEnv.aiVisionModel),
    urlReputation: Boolean(serverEnv.safeBrowsingApiKey),
    cloudPersistence: supabase,
    accounts: supabase,
  };
}

/**
 * Client-safe capability snapshot. Only reports whether an *optional* feature
 * is switched on; exposes no secrets. Used for status banners.
 */
export function getPublicCapabilities() {
  const full = getCapabilities();
  return {
    ai: full.ai,
    aiVision: full.aiVision,
    urlReputation: full.urlReputation,
    cloudPersistence: full.cloudPersistence,
    mode: full.ai ? ("assisted" as const) : ("rules-only" as const),
  };
}
