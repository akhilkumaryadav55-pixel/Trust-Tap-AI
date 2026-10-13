import type { Severity } from "@/lib/types";


/** A bilingual string. Rules carry both languages so results are localised
 *  without a second translation pass (and without an AI call). */
export type Bi = { en: string; hi: string };

export type RuleCategory =
  | "urgency"
  | "credential_request"
  | "payment_demand"
  | "advance_fee"
  | "authority_impersonation"
  | "account_threat"
  | "link"
  | "remote_access"
  | "investment"
  | "prize"
  | "secrecy"
  | "delivery"
  | "verification"
  | "job"
  | "malformed_content";

export type Rule = {
  /** Stable identifier. Appears in saved results and in the scoring docs. */
  id: string;
  category: RuleCategory;
  severity: Severity;
  /**
   * Points contributed to the indicative score when this rule matches.
   * Tuned so that no single medium rule can reach the "elevated" band alone.
   */
  weight: number;
  title: Bi;
  explanation: Bi;
  /**
   * Patterns are matched case-insensitively. They are intentionally NOT
   * global — the matcher clones them, so shared module state can never leak
   * between concurrent requests.
   */
  patterns: RegExp[];
  /** How many pattern hits are required before the rule fires. Default 1. */
  minMatches?: number;
  /**
   * The rule only fires when at least one of these also matches. This is how
   * we avoid flagging a legitimate message that merely contains the word
   * "urgent" or "payment" (see docs/SCORING.md).
   */
  requiresAny?: RegExp[];
  /**
   * Softening signals. When present and the rule matched only once, its weight
   * is halved — a real business message often includes these.
   */
  reducesWhen?: RegExp[];
  /**
   * Absolute vetoes. If ANY of these match, the rule cannot fire at all.
   *
   * This is what stops us flagging a genuine bank advisory that says
   * "never share your OTP with anyone" as an OTP-request scam.
   */
  excludesAny?: RegExp[];
  /**
   * Scan the raw, un-normalised text instead of the normalised form. Used by
   * the rule that detects deliberately obfuscated characters, which
   * normalisation would otherwise erase.
   */
  scanRaw?: boolean;
  /** Ascending within a severity tier; used for deterministic ordering. */
  order: number;
};
