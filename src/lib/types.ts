/**
 * Shared domain types for TrustTap AI.
 *
 * These types are the contract between the analysis engine, the API route
 * handlers and the UI. The AI is never trusted to define this shape — every
 * model response is validated against a schema before it reaches a component.
 */

/** Categories a user can tag their submission with. */
export const CONTENT_TYPES = [
  "sms",
  "whatsapp",
  "email",
  "job_offer",
  "scholarship",
  "online_shopping",
  "banking_payment",
  "social_media",
  "other",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

/**
 * The four primary outcomes, plus "unable_to_assess" for when essential
 * evidence is missing or a required service failed.
 *
 * These strings are stable identifiers used across the API, storage and UI.
 * They are never shown to users raw — see `lib/i18n`.
 */
export const RISK_LEVELS = [
  "high",
  "elevated",
  "caution",
  "no_obvious_red_flags",
  "unable_to_assess",
] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export type Severity = "low" | "medium" | "high";
export type Language = "en" | "hi";

/** Where a finding came from. Used to keep evidence provenance honest. */
export type FindingSource = "rule" | "ai" | "reputation" | "structure";

export type Finding = {
  /** Stable rule id, e.g. `urgency_pressure`. Absent for AI findings. */
  id?: string;
  title: string;
  /**
   * The exact substring / behaviour from the user's own submission that
   * triggered this finding. Never invented — see `excerpt.ts`.
   */
  evidence: string;
  /** Why this matters, in plain language. */
  explanation: string;
  severity: Severity;
  source: FindingSource;
  /** Indicator weight contributed to the aggregate score (0-100 scale). */
  weight: number;
};

export type ResourceLink = {
  title: string;
  url: string;
  reason: string;
};

/** Result of an external domain-reputation lookup, if one actually ran. */
export type ReputationOutcome = {
  /** True only when a real network call to a real provider succeeded. */
  checked: boolean;
  provider: "google_safe_browsing" | null;
  verdict: "clean" | "threat" | "unavailable" | "skipped";
  threats: string[];
  /** Human-readable, honest description of what happened. */
  note: string;
};

/** One structural observation about a URL. */
export type UrlSignal = {
  id: string;
  label: string;
  detail: string;
  severity: Severity;
  weight: number;
};

export type UrlReport = {
  input: string;
  normalized: string;
  valid: boolean;
  protocol: string | null;
  hostname: string | null;
  registrableDomain: string | null;
  tld: string | null;
  isIpLiteral: boolean;
  isShortener: boolean;
  signals: UrlSignal[];
  basicScore: number;
  basicRiskLevel: RiskLevel;
  reputation: ReputationOutcome;
};

export type EngineMeta = {
  engineVersion: string;
  /** True only when a real AI call returned a schema-valid response. */
  aiUsed: boolean;
  /** True when this deployment had an AI provider configured for the request. */
  aiConfigured: boolean;
  aiModel: string | null;
  /** Populated when AI was configured but failed/was rejected. */
  aiError: string | null;
  rulesEvaluated: number;
  rulesMatched: number;
  reputationChecked: boolean;
  reputationProviders: string[];
  inputLength: number;
  inputTruncated: boolean;
  sensitiveInputDetected: boolean;
  sensitiveCategories: string[];
  /** SHA-256 of the raw input, truncated. Used for dedupe without storing text. */
  contentHash: string;
  /** Redacted, length-capped excerpt safe to persist. */
  redactedPreview: string;
  processingMs: number;
};

export type AnalysisResult = {
  id: string;
  createdAt: string;
  contentType: ContentType;
  language: Language;
  riskLevel: RiskLevel;
  /**
   * Indicative 0-100 risk indicator score. NOT a probability that fraud
   * will occur.
   */
  riskScore: number;
  summary: string;
  findings: Finding[];
  recommendedActions: string[];
  actionsToAvoid: string[];
  uncertainties: string[];
  resources: ResourceLink[];
  meta: EngineMeta;
};

/** Metadata-only record used for saved history (no raw content). */
export type SavedAnalysisSummary = {
  id: string;
  createdAt: string;
  contentType: ContentType;
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  source: "local" | "cloud";
};

export type AnalysisMode = "text" | "screenshot" | "url";

export type UrlAnalyzeRequest = {
  mode: "url";
  url: string;
  language: Language;
  contentType?: ContentType;
};

export type TextAnalyzeRequest = {
  mode: "text";
  text: string;
  contentType: ContentType;
  language: Language;
  /** Optional: extra structure extracted from OCR, kept separate for provenance. */
  extractedFromImage?: boolean;
};

export type AnalyzeRequest = TextAnalyzeRequest | UrlAnalyzeRequest;

export type ApiError = {
  error: {
    code:
      | "invalid_input"
      | "too_large"
      | "unsupported_type"
      | "rate_limited"
      | "timeout"
      | "provider_error"
      | "internal_error";
    message: string;
    /** Field-level details for form rendering. */
    fields?: Record<string, string>;
  };
};

export type AnalyzeResponse = AnalysisResult;

/** Health/readiness payload surfaced in the UI status banner. */
export type HealthResponse = {
  ok: boolean;
  mode: "assisted" | "rules-only";
  capabilities: {
    ai: boolean;
    aiVision: boolean;
    urlReputation: boolean;
    cloudPersistence: boolean;
  };
  version: string;
  time: string;
};
