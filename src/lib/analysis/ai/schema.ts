import { z } from "zod";
import type { Finding, Language, RiskLevel, Severity } from "@/lib/types";
import { filterAiResources } from "@/lib/content/resources";

/**
 * Strict validation of AI output.
 *
 * Three guarantees are enforced here, in order:
 *
 * 1. **Shape.** The model must return the documented object, within hard
 *    length limits. Anything else is rejected outright — we never half-render
 *    a malformed response.
 * 2. **Grounding.** Every `evidence` string must actually occur in the text we
 *    sent. A model that invents a quote has its evidence replaced with an
 *    honest placeholder, the finding is zero-weighted, and the fact is
 *    recorded in `uncertainties`. (See docs/SCORING.md.)
 * 3. **Link allowlist.** Any `resources` entry not pointing at an official,
 *    allowlisted host is discarded.
 *
 * The model's own `riskScore` is parsed for completeness and then deliberately
 * discarded — the score users see is always computed by `scoring.ts`.
 */

/** Remove control characters and collapse whitespace. */
function clean(value: string, max: number): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const shortText = (max: number) => z.string().transform((v) => clean(v, max));

const sev = z.enum(["low", "medium", "high"]);
const risk = z.enum([
  "high",
  "elevated",
  "caution",
  "no_obvious_red_flags",
  "unable_to_assess",
]);

export const aiFindingSchema = z.object({
  title: shortText(160),
  evidence: shortText(400),
  explanation: shortText(700),
  severity: sev,
});

export const aiResourceSchema = z.object({
  title: shortText(140),
  url: z.string().max(2048),
  reason: shortText(300),
});

export const aiAnalysisSchema = z.object({
  contentType: shortText(40),
  riskLevel: risk,
  riskScore: z.coerce.number().min(0).max(100).optional(),
  summary: shortText(700),
  findings: z.array(aiFindingSchema).max(8),
  recommendedActions: z.array(shortText(300)).max(8),
  actionsToAvoid: z.array(shortText(300)).max(6),
  uncertainties: z.array(shortText(300)).max(6),
  resources: z.array(aiResourceSchema).max(6),
});

export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;

export type AiParseSuccess = {
  ok: true;
  value: AiAnalysis;
  /** Non-fatal issues worth surfacing to the user (ungrounded quotes, dropped links). */
  warnings: string[];
  /** Findings with grounding applied; ungrounded ones carry weight 0. */
  findings: Finding[];
  /** Only allowlisted resource links survive. */
  acceptedResources: { title: string; url: string; reason: string }[];
  rejectedResourceUrls: string[];
};

export type AiParseFailure = { ok: false; error: string };

const AI_WEIGHT_BY_SEVERITY: Record<Severity, number> = {
  high: 18,
  medium: 12,
  low: 6,
};

/**
 * Strip JSON fences and leading prose. Models occasionally wrap JSON in
 * markdown even when asked not to; we accept that but nothing else.
 */
export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    // Fall back to the outermost {...} span.
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start === -1 || end <= start) {
      throw new Error("Model response did not contain a JSON object");
    }
    return JSON.parse(withoutFence.slice(start, end + 1));
  }
}

/**
 * Is this quote genuinely present in the submitted text?
 *
 * Tolerates the normal ways a model shortens a quote: ellipses, different
 * casing, collapsed whitespace, and truncation. Anything else is treated as
 * fabricated.
 */
export function evidenceGrounded(evidence: string, sourceText: string): boolean {
  const normalizedEvidence = evidence
    .replace(/^[.…\s]+|[.…\s]+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
  const normalizedSource = sourceText.replace(/\s+/g, " ").toLowerCase();

  if (normalizedEvidence.length < 3) return false;
  if (normalizedSource.includes(normalizedEvidence)) return true;

  // Longest run of consecutive words (>=4) that appears verbatim.
  const words = normalizedEvidence.split(" ").filter(Boolean);
  for (let span = words.length; span >= 4; span -= 1) {
    for (let i = 0; i + span <= words.length; i += 1) {
      const candidate = words.slice(i, i + span).join(" ");
      if (candidate.length >= 12 && normalizedSource.includes(candidate)) {
        return true;
      }
    }
  }
  return false;
}

export function parseAiAnalysis(
  raw: unknown,
  options: { sourceText: string; language: Language },
): AiParseSuccess | AiParseFailure {
  const parsed = aiAnalysisSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first
        ? `Response failed validation at "${first.path.join(".") || "root"}": ${first.message}`
        : "Response failed validation",
    };
  }

  const value = parsed.data;
  const warnings: string[] = [];

  // --- Grounding -----------------------------------------------------------
  const findings: Finding[] = value.findings.map((finding) => {
    const grounded = evidenceGrounded(finding.evidence, options.sourceText);
    if (!grounded) {
      warnings.push(
        `A model finding ("${finding.title}") quoted text that could not be matched in your submission and was not counted.`,
      );
    }
    return {
      title: finding.title,
      evidence: grounded
        ? finding.evidence
        : "The model quoted this, but the wording could not be matched anywhere in your submitted text, so we did not count it.",
      explanation: finding.explanation,
      severity: finding.severity,
      source: "ai" as const,
      weight: grounded ? AI_WEIGHT_BY_SEVERITY[finding.severity] : 0,
    };
  });

  // --- Link allowlist ------------------------------------------------------
  const { accepted, rejected } = filterAiResources(value.resources);
  if (rejected.length > 0) {
    warnings.push(
      `Discarded ${rejected.length} link(s) suggested by the model that were not on the official-resource allowlist.`,
    );
  }

  return {
    ok: true,
    value,
    warnings,
    findings,
    acceptedResources: accepted,
    rejectedResourceUrls: rejected,
  };
}

/** AI risk levels map 1:1 onto ours, but we never take the model's score. */
export function aiRiskLevel(value: string): RiskLevel | null {
  return (risk.options as readonly string[]).includes(value)
    ? (value as RiskLevel)
    : null;
}
