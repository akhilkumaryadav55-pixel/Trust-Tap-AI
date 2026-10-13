import { createHash, randomUUID } from "node:crypto";
import type {
  AnalysisResult,
  ContentType,
  Finding,
  FindingSource,
  Language,
  RiskLevel,
  Severity,
  UrlReport,
} from "@/lib/types";
import { serverEnv } from "@/lib/env";
import { condense, extractUrls } from "./rules/normalize";
import { scanRules, type RuleMatch } from "./rules/match";
import { detectAndRedact } from "./sensitive";
import { classifyContent, detectLanguage, looksUrlOnly } from "./classify";
import { analyseUrlStructure } from "./url";
import { URL_SIGNAL_TEXT } from "./url-signal-i18n";
import { checkUrlReputation, skippedReputation } from "./reputation";
import {
  computeScore,
  ENGINE_VERSION,
  usableLength as countUsable,
} from "./scoring";
import {
  composeActions,
  composeActionsToAvoid,
  composeSummary,
  composeUncertainties,
} from "./summary";
import { resolveResourceIntent, resolveResources } from "@/lib/content/resources";
import { ANALYSIS_POLICY, buildUserPrompt } from "./ai/prompt";
import { aiConfigured, requestStructuredAnalysis } from "./ai/provider";
import { parseAiAnalysis, type AiParseSuccess } from "./ai/schema";

/**
 * The analysis pipeline.
 *
 *   input validation → classification → rule indicators → URL structure (if a
 *   link is present) → optional reputation lookup → optional AI interpretation
 *   → schema validation + grounding → risk aggregation → localised result
 *
 * Every stage degrades independently and reports what it did and did not do.
 * Nothing here ever claims a check ran when it did not.
 */

export type AnalyzeTextInput = {
  text: string;
  contentType?: ContentType;
  language?: Language;
  /** True when the text was produced by OCR rather than typed. */
  extractedFromImage?: boolean;
};

export type AnalyzeUrlInput = {
  url: string;
  language?: Language;
  contentType?: ContentType;
};

/** Strip control characters and normalise newlines. */
export function sanitizeInput(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function hashContent(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 32);
}

function severityRank(severity: Severity): number {
  return severity === "high" ? 0 : severity === "medium" ? 1 : 2;
}

function findingFromRule(match: RuleMatch, language: Language): Finding {
  return {
    id: match.rule.id,
    title: match.rule.title[language],
    evidence: match.evidence,
    explanation: match.rule.explanation[language],
    severity: match.rule.severity,
    source: "rule",
    weight: match.weight,
  };
}

function findingsFromUrlReport(report: UrlReport, language: Language): Finding[] {
  return report.signals.map((signal) => {
    const text = URL_SIGNAL_TEXT[signal.id];
    return {
      id: signal.id,
      title: text ? text.title[language] : signal.label,
      evidence: `Link: ${report.hostname ?? report.input}`,
      explanation: text ? text.explanation[language] : signal.detail,
      severity: signal.severity,
      source: "structure" as FindingSource,
      weight: signal.weight,
    };
  });
}

function reputationFinding(report: UrlReport, language: Language): Finding | null {
  if (!report.reputation.checked || report.reputation.verdict !== "threat") {
    return null;
  }
  return {
    id: "reputation_threat",
    title:
      language === "hi"
        ? "प्रतिष्ठा सेवा ने यह पता असुरक्षित बताया"
        : "A reputation service listed this address as unsafe",
    evidence: `Link: ${report.normalized}`,
    explanation:
      language === "hi"
        ? `Google Safe Browsing ने इस पते को इन श्रेणियों में दर्ज किया: ${report.reputation.threats.join(", ")}.`
        : `Google Safe Browsing reported this address under: ${report.reputation.threats.join(", ")}.`,
    severity: "high",
    source: "reputation",
    weight: 30,
  };
}

type PipelineState = {
  language: Language;
  findings: Finding[];
  ruleMatches: RuleMatch[];
  urlReport: UrlReport | null;
  ai: AiParseSuccess | null;
  aiError: string | null;
  aiExpected: boolean;
  truncated: boolean;
  usable: number;
  redactedPreview: string;
  contentHash: string;
  inputLength: number;
  sensitiveDetected: boolean;
  sensitiveCategories: string[];
  rulesEvaluated: number;
  contentType: ContentType;
  startedAt: number;
  urlOnly: boolean;
};

async function runPipeline(state: PipelineState): Promise<AnalysisResult> {
  const {
    language,
    findings,
    ruleMatches,
    urlReport,
    ai,
    aiError,
    aiExpected,
    truncated,
    usable,
    redactedPreview,
    contentHash,
    inputLength,
    sensitiveDetected,
    sensitiveCategories,
    rulesEvaluated,
    contentType,
    startedAt,
    urlOnly,
  } = state;

  // --- Merge and order findings -------------------------------------------
  const allFindings: Finding[] = [
    ...findings,
    ...(ai ? ai.findings : []),
  ].sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      b.weight - a.weight,
  );

  // --- Risk aggregation ----------------------------------------------------
  const scoring = computeScore({
    matches: ruleMatches,
    aiFindings: ai ? ai.findings : [],
    reputation: urlReport?.reputation ?? null,
    usableLength: usable,
    aiExpected,
    aiError,
    urlReport,
    urlValid: urlReport ? urlReport.valid : true,
    urlOnly,
  });

  const riskLevel: RiskLevel = scoring.riskLevel;

  // A threat verdict must surface as its own finding even if rules were quiet.
  const repFinding = urlReport ? reputationFinding(urlReport, language) : null;
  const finalFindings = repFinding
    ? [repFinding, ...allFindings.filter((f) => f.id !== "reputation_threat")]
    : allFindings;

  // --- Localised narrative -------------------------------------------------
  const categories = Array.from(
    new Set(ruleMatches.map((m) => m.rule.category)),
  );

  const summary = composeSummary({
    language,
    riskLevel,
    matches: ruleMatches,
    aiSummary: ai ? ai.value.summary : null,
    unableReason: scoring.unableReason,
  });

  const recommendedActions = composeActions({
    language,
    riskLevel,
    matches: ruleMatches,
    aiActions: ai ? ai.value.recommendedActions : [],
  });

  const actionsToAvoid = composeActionsToAvoid({
    language,
    aiActionsToAvoid: ai ? ai.value.actionsToAvoid : [],
  });

  const uncertainties = composeUncertainties({
    language,
    riskLevel,
    matches: ruleMatches,
    aiUncertainties: ai ? ai.value.uncertainties : [],
    aiWarnings: ai ? ai.warnings : [],
    reputation: urlReport?.reputation ?? null,
    urlReport,
    truncated,
    usableLength: usable,
  });

  // --- Resources (allowlisted, never model-invented) -----------------------
  const intent = resolveResourceIntent({ categories, riskLevel, contentType });
  const resources = resolveResources({ language, intent });

  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    contentType,
    language,
    riskLevel,
    riskScore: scoring.score,
    summary,
    findings: finalFindings,
    recommendedActions,
    actionsToAvoid,
    uncertainties,
    resources,
    meta: {
      engineVersion: ENGINE_VERSION,
      aiUsed: Boolean(ai),
      aiConfigured: aiExpected,
      aiModel: ai ? "configured" : null,
      aiError,
      rulesEvaluated,
      rulesMatched: ruleMatches.length,
      reputationChecked: Boolean(urlReport?.reputation.checked),
      reputationProviders: urlReport?.reputation.provider
        ? [urlReport.reputation.provider]
        : [],
      inputLength,
      inputTruncated: truncated,
      sensitiveInputDetected: sensitiveDetected,
      sensitiveCategories,
      contentHash,
      redactedPreview,
      processingMs: Date.now() - startedAt,
    },
  };
}

/** Shared AI step: build the prompt, call the provider, validate the response. */
async function runAiStep(input: {
  text: string;
  contentType: ContentType;
  language: Language;
  ruleMatches: RuleMatch[];
  urlReport: UrlReport | null;
}): Promise<{ ai: AiParseSuccess | null; aiError: string | null; aiExpected: boolean }> {
  const aiExpected = aiConfigured();
  if (!aiExpected) return { ai: null, aiError: null, aiExpected };

  const user = buildUserPrompt({
    text: input.text,
    contentType: input.contentType,
    language: input.language,
    ruleMatches: input.ruleMatches,
    urlReport: input.urlReport,
    reputationNote: input.urlReport?.reputation.note ?? null,
  });
  const result = await requestStructuredAnalysis(ANALYSIS_POLICY, user);

  if (!result.ok) {
    return { ai: null, aiError: result.error, aiExpected };
  }

  let raw: unknown;
  try {
    raw = extractJsonFromText(result.content);
  } catch (error) {
    return {
      ai: null,
      aiError: error instanceof Error ? error.message : "Unparseable AI response",
      aiExpected,
    };
  }

  const parsed = parseAiAnalysis(raw, {
    sourceText: input.text,
    language: input.language,
  });

  if (!parsed.ok) {
    return { ai: null, aiError: parsed.error, aiExpected };
  }

  return { ai: parsed, aiError: null, aiExpected };
}

function extractJsonFromText(content: string): unknown {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) {
      throw new Error("The AI provider did not return a JSON object.");
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalysisResult> {
  const startedAt = Date.now();
  const sanitized = sanitizeInput(input.text);
  const maxChars = serverEnv.maxMessageChars;
  const truncated = sanitized.length > maxChars;
  const capped = truncated ? sanitized.slice(0, maxChars) : sanitized;

  // A submission that is only a link is handled by the URL pipeline, which
  // produces a far more accurate result than treating it as prose.
  if (looksUrlOnly(capped)) {
    return analyzeUrl({
      url: capped,
      language: input.language,
      contentType: input.contentType,
    });
  }

  const language = input.language ?? detectLanguage(capped);
  const sensitive = detectAndRedact(capped);
  const working = sensitive.redacted;

  const classification = classifyContent(working, input.contentType);
  const scan = scanRules(working);

  // Offline URL structure analysis for any address inside the message.
  const embeddedUrls = extractUrls(working);
  let urlReport: UrlReport | null = null;
  if (embeddedUrls.length > 0) {
    urlReport = analyseUrlStructure(embeddedUrls[0]);
    if (urlReport.valid) {
      urlReport.reputation = await checkUrlReputation(urlReport.normalized);
    }
  }

  const { ai, aiError, aiExpected } = await runAiStep({
    text: working,
    contentType: classification.contentType,
    language,
    ruleMatches: scan.matches,
    urlReport,
  });

  return runPipeline({
    language,
    findings: [
      ...scan.matches.map((m) => findingFromRule(m, language)),
      ...(urlReport ? findingsFromUrlReport(urlReport, language) : []),
    ],
    ruleMatches: scan.matches,
    urlReport,
    ai,
    aiError,
    aiExpected,
    truncated,
    usable: countUsable(working),
    redactedPreview: condense(working, 240),
    contentHash: hashContent(working),
    inputLength: capped.length,
    sensitiveDetected: sensitive.detected,
    sensitiveCategories: sensitive.categories,
    rulesEvaluated: scan.rulesEvaluated,
    contentType: classification.contentType,
    startedAt,
    urlOnly: false,
  });
}

export async function analyzeUrl(input: AnalyzeUrlInput): Promise<AnalysisResult> {
  const startedAt = Date.now();
  const sanitized = sanitizeInput(input.url);
  const report = analyseUrlStructure(sanitized);

  if (report.valid) {
    report.reputation = await checkUrlReputation(report.normalized);
  } else {
    report.reputation = skippedReputation(
      "The address could not be parsed, so no reputation lookup was attempted.",
    );
  }

  const language = input.language ?? "en";
  const classifications = classifyContent(sanitized, input.contentType ?? "other");

  const { ai, aiError, aiExpected } = await runAiStep({
    text: report.normalized || sanitized,
    contentType: classifications.contentType,
    language,
    ruleMatches: [],
    urlReport: report,
  });

  return runPipeline({
    language,
    findings: findingsFromUrlReport(report, language),
    ruleMatches: [],
    urlReport: report,
    ai,
    aiError,
    aiExpected,
    truncated: false,
    usable: countUsable(sanitized),
    redactedPreview: condense(`${report.hostname ?? sanitized}`, 240),
    contentHash: hashContent(report.normalized || sanitized),
    inputLength: sanitized.length,
    sensitiveDetected: false,
    sensitiveCategories: [],
    rulesEvaluated: 0,
    contentType: classifications.contentType,
    startedAt,
    urlOnly: true,
  });
}
