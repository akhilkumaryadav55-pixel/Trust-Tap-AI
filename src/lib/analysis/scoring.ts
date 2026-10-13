import type {
  Finding,
  ReputationOutcome,
  RiskLevel,
  Severity,
  UrlReport,
} from "@/lib/types";
import type { RuleMatch } from "./rules/match";

/**
 * Risk aggregation.
 *
 * Documented in docs/SCORING.md — keep the two in sync.
 *
 * The score is an INDICATIVE 0-100 indicator, never a probability. The model is
 * deliberately conservative and explainable:
 *
 *  1. Sum matched rule weights, but cap each rule *category* at
 *     `CATEGORY_CAP` so three near-duplicate rules cannot manufacture a
 *     "high risk" verdict on their own.
 *  2. Add the offline URL structure score from `analyseUrlStructure`. Its
 *     signals are distinct, individually observable properties of the address
 *     (raw IP host, brand lookalike, plain http, …) that the prose rules cannot
 *     see, so they are summed as their own block rather than being folded into
 *     a single rule category. The URL module already caps its own total at 100.
 *  3. Add explicit combination bonuses for the shapes that are genuinely
 *     dangerous (a credential request *plus* urgency, etc.). These encode
 *     domain knowledge that simple summation cannot.
 *  4. Add a small, capped contribution from AI findings. The AI's own
 *     confidence wording is never used as evidence.
 *  5. A single high-severity match floors the score at `HIGH_SEVERITY_FLOOR`,
 *     so a direct OTP request — or a brand-lookalike address — is never
 *     reported as merely "Caution".
 *  6. Dampen when only low-severity rules matched and the message contains
 *     legitimate-context language (opt-out lines, anti-fraud warnings).
 *  7. For an address-only check, honour the URL module's more cautious
 *     thresholds as well: the same address must never look worse in the link
 *     preview than it does in the final report.
 *  8. A threat verdict from a real reputation provider overrides everything.
 */

export const CATEGORY_CAP = 30;
export const HIGH_SEVERITY_FLOOR = 40;
export const THRESHOLD_HIGH = 65;
export const THRESHOLD_ELEVATED = 40;
export const THRESHOLD_CAUTION = 18;

/** Minimum letters/digits before we have anything to analyse at all. */
export const MIN_USABLE_CHARS = 20;

export const ENGINE_VERSION = "1.0.0";

export type Bonus = {
  id: string;
  points: number;
  reason: string;
};

export type ScoreInput = {
  matches: RuleMatch[];
  /** Findings produced by the AI layer only (source === "ai"). */
  aiFindings: Finding[];
  reputation: ReputationOutcome | null;
  /** Count of letters/digits in the (redacted) submission. */
  usableLength: number;
  /** True when the deployment had an AI provider configured for this request. */
  aiExpected: boolean;
  /** Error message when an expected AI call failed. */
  aiError: string | null;
  /** Structural report for an address in the submission, when there is one. */
  urlReport?: UrlReport | null;
  /** Set for URL-only checks. */
  urlValid?: boolean;
  /** True when only a URL was submitted (no message context). */
  urlOnly?: boolean;
};

/** Ordering used to combine the engine verdict with the URL module's verdict. */
const RISK_ORDER: Record<RiskLevel, number> = {
  unable_to_assess: 0,
  no_obvious_red_flags: 1,
  caution: 2,
  elevated: 3,
  high: 4,
};

function worseOf(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER[b] > RISK_ORDER[a] ? b : a;
}

export type ScoreOutput = {
  score: number;
  riskLevel: RiskLevel;
  categoryTotals: Record<string, number>;
  bonuses: Bonus[];
  dampened: boolean;
  maxSeverity: Severity | null;
  /** Populated only when the outcome is `unable_to_assess`. */
  unableReason: string | null;
  confidence: "high" | "medium" | "low";
};

/** Count letters and digits — the characters that carry meaning. */
export function usableLength(input: string): number {
  const matches = input.match(/[\p{L}\p{N}]/gu);
  return matches ? matches.length : 0;
}

function hasCategory(matches: RuleMatch[], category: string): boolean {
  return matches.some((m) => m.rule.category === category);
}

/** Highest severity among any set of findings, rules or URL signals. */
function maxSeverityFrom(values: { severity: Severity }[]): Severity | null {
  if (values.length === 0) return null;
  const rank: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  return values.reduce<Severity>(
    (acc, value) => (rank[value.severity] < rank[acc] ? value.severity : acc),
    "low",
  );
}

const AI_FINDING_POINTS: Record<Severity, number> = {
  high: 12,
  medium: 8,
  low: 4,
};

const AI_CONTRIBUTION_CAP = 24;

export function computeScore(input: ScoreInput): ScoreOutput {
  const {
    matches,
    aiFindings,
    reputation,
    usableLength: length,
    aiExpected,
    aiError,
    urlReport = null,
    urlValid = true,
    urlOnly = false,
  } = input;

  // URL structure evidence. `basicScore` is 0 for a coherent, ordinary address,
  // so a benign link inside a message cannot inflate the verdict on its own.
  const urlSignals = urlReport?.valid ? urlReport.signals : [];
  const urlSubtotal = urlReport?.valid ? urlReport.basicScore : 0;

  const maxSeverity = maxSeverityFrom([
    ...matches.map((m) => m.rule),
    ...urlSignals,
  ]);
  const matchedCategories = new Set(matches.map((m) => m.rule.category));

  // --- 1. Category-capped rule subtotal ------------------------------------
  const rawCategoryTotals: Record<string, number> = {};
  for (const match of matches) {
    const key = match.rule.category;
    rawCategoryTotals[key] = (rawCategoryTotals[key] ?? 0) + match.weight;
  }
  const categoryTotals: Record<string, number> = {};
  let subtotal = 0;
  for (const [key, value] of Object.entries(rawCategoryTotals)) {
    const capped = Math.min(value, CATEGORY_CAP);
    categoryTotals[key] = capped;
    subtotal += capped;
  }

  // --- 2. Combination bonuses ----------------------------------------------
  const bonuses: Bonus[] = [];
  const credentials = hasCategory(matches, "credential_request");
  const money =
    hasCategory(matches, "payment_demand") || hasCategory(matches, "advance_fee");
  const urgency = hasCategory(matches, "urgency");
  const links = hasCategory(matches, "link");
  const impersonation = hasCategory(matches, "authority_impersonation");
  const threats = hasCategory(matches, "account_threat");

  if (credentials && urgency) {
    bonuses.push({
      id: "credential_with_urgency",
      points: 12,
      reason:
        "A request for a secret was paired with time pressure — the classic credential-theft shape.",
    });
  }
  if (money && urgency) {
    bonuses.push({
      id: "payment_with_urgency",
      points: 10,
      reason: "A payment was demanded with a deadline attached.",
    });
  }
  if (links && (credentials || money)) {
    bonuses.push({
      id: "link_with_request",
      points: 8,
      reason:
        "A link was supplied together with a request for information or money.",
    });
  }
  if (impersonation && money) {
    bonuses.push({
      id: "impersonation_with_payment",
      points: 10,
      reason:
        "Someone claimed official authority and asked for money at the same time.",
    });
  }
  if (threats && money) {
    bonuses.push({
      id: "threat_with_payment",
      points: 10,
      reason: "A consequence was threatened unless money was paid.",
    });
  }

  const urlLookalike = urlSignals.some((s) => s.id === "brand_lookalike");
  const urlAccountPath = urlSignals.some(
    (s) => s.id === "phishing_path_vocabulary",
  );
  if (urlLookalike && urlAccountPath) {
    bonuses.push({
      id: "lookalike_with_account_path",
      points: 10,
      reason:
        "The address imitates a known brand *and* points at an account or verification page — the shape of a credential-harvesting link.",
    });
  }

  const bonusTotal = bonuses.reduce((sum, b) => sum + b.points, 0);

  // --- 3. AI contribution (capped, never treated as proof) -----------------
  const aiRaw = aiFindings.reduce(
    (sum, f) => sum + (AI_FINDING_POINTS[f.severity] ?? 4),
    0,
  );
  const aiContribution = Math.min(aiRaw, AI_CONTRIBUTION_CAP);

  // --- 4. Dampening for legitimately-worded low-severity matches ----------
  const legitimateContext = matches.some((m) => m.dampened);
  const dampened =
    legitimateContext && maxSeverity === "low" && matchedCategories.size <= 2;
  const dampeningFactor = dampened ? 0.6 : 1;

  let score = Math.round(
    (subtotal + urlSubtotal + bonusTotal + aiContribution) * dampeningFactor,
  );

  // --- 5. Single high-severity floor --------------------------------------
  if (maxSeverity === "high" && score < HIGH_SEVERITY_FLOOR) {
    score = HIGH_SEVERITY_FLOOR;
  }

  // --- 6. A real threat verdict overrides everything ----------------------
  if (reputation?.checked && reputation.verdict === "threat") {
    score = Math.max(score, 85);
  }

  score = Math.max(0, Math.min(100, score));

  // --- Unable to assess ----------------------------------------------------
  let unableReason: string | null = null;
  if (urlOnly && !urlValid) {
    unableReason = "The address could not be parsed, so there was nothing to analyse.";
  } else if (!urlOnly && length < MIN_USABLE_CHARS) {
    // Prose needs a minimum amount of substance. An *address* does not: a valid
    // host is already structured evidence, and short addresses are exactly the
    // kind that need checking.
    unableReason = `Only ${length} readable characters were submitted, which is too little to reach a conclusion.`;
  } else if (aiExpected && aiError && matches.length === 0 && !urlOnly) {
    // A check we intended to run failed and nothing else found anything: we
    // genuinely cannot reach a conclusion. URL-only checks are excluded because
    // the structural analysis is a complete offline check in its own right.
    unableReason =
      "The AI interpretation was configured but failed, and no rule-based indicators matched, so no reliable conclusion is possible.";
  }

  const levelFromScore = (value: number): RiskLevel =>
    value >= THRESHOLD_HIGH
      ? "high"
      : value >= THRESHOLD_ELEVATED
        ? "elevated"
        : value >= THRESHOLD_CAUTION
          ? "caution"
          : "no_obvious_red_flags";

  let riskLevel: RiskLevel;
  if (unableReason) {
    riskLevel = "unable_to_assess";
  } else if (reputation?.checked && reputation.verdict === "threat") {
    riskLevel = "high";
  } else if (urlOnly && urlReport?.valid) {
    // The link preview shows the address's own rating, so the saved report must
    // never be more reassuring than what the user already saw.
    riskLevel = worseOf(levelFromScore(score), urlReport.basicRiskLevel);
  } else {
    riskLevel = levelFromScore(score);
  }

  // --- Confidence ----------------------------------------------------------
  // AI findings deliberately do not count towards `confidence`: the model's own
  // certainty is not independent evidence.
  const evidenceCount = matches.length + urlSignals.length;
  const confidence: ScoreOutput["confidence"] =
    maxSeverity === "high" && evidenceCount >= 2
      ? "high"
      : evidenceCount >= 1 || aiFindings.length > 0
        ? "medium"
        : "low";

  return {
    score,
    riskLevel,
    categoryTotals,
    bonuses,
    dampened,
    maxSeverity,
    unableReason,
    confidence,
  };
}
