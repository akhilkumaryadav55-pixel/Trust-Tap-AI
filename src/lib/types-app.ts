/**
 * Client-facing type surface.
 *
 * The domain contract lives in `lib/types.ts` (shared with the server). This
 * module adds the few types that only the browser needs, so a client component
 * can import from one place without pulling in server modules.
 */

export {
  CONTENT_TYPES,
  RISK_LEVELS,
} from "./types";

export type {
  AnalysisResult,
  AnalysisMode,
  ContentType,
  EngineMeta,
  Finding,
  HealthResponse,
  Language,
  ReputationOutcome,
  ResourceLink,
  RiskLevel,
  SavedAnalysisSummary,
  Severity,
  UrlReport,
  UrlSignal,
} from "./types";

export type ThemePreference = "light" | "dark" | "system";

export type IncidentSituation =
  | "clicked_link"
  | "shared_personal_info"
  | "shared_otp"
  | "approved_payment"
  | "installed_app"
  | "shared_screen"
  | "threat_call"
  | "something_else";

export type UploadState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "ready"; file: File; previewUrl: string; format: string }
  | { status: "error"; message: string };
