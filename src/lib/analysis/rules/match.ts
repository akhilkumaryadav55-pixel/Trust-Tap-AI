import type { Severity } from "@/lib/types";
import { RULES, LEGITIMATE_CONTEXT_MARKERS } from "./catalog";
import type { Rule } from "./types";
import {
  excerptAround,
  excerptAt,
  normalizeForMatching,
} from "./normalize";

export type RuleMatch = {
  rule: Rule;
  /** How many pattern hits contributed. */
  count: number;
  /** The real substring from the user's submission that triggered the rule. */
  evidence: string;
  /** Effective points after any dampening. */
  weight: number;
  /** True when a softening marker halved the weight. */
  dampened: boolean;
  /** Index of the first hit in the text that was scanned. */
  index: number;
};

export type RuleScanResult = {
  matches: RuleMatch[];
  rulesEvaluated: number;
  /** True when at least one legitimate-context marker was present. */
  legitimateContext: boolean;
  /** Highest severity among matched rules, or null when nothing matched. */
  maxSeverity: Severity | null;
};

/**
 * Clone a pattern with the global flag so `exec` can iterate.
 *
 * This matters for correctness under concurrency: catalog patterns are module
 * level, and a shared `lastIndex` across concurrent requests would silently
 * skip matches. Cloning gives every scan its own state.
 */
function toGlobal(pattern: RegExp): RegExp {
  const flags = pattern.flags.includes("g")
    ? pattern.flags
    : `${pattern.flags}g`;
  return new RegExp(pattern.source, flags);
}

type Hit = { index: number; length: number; text: string };

/** Find the first hit of a pattern in `subject`, and how many hits there are. */
function scan(subject: string, pattern: RegExp): { first: Hit | null; count: number } {
  const re = toGlobal(pattern);
  let count = 0;
  let first: Hit | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(subject)) !== null) {
    count += 1;
    if (!first) {
      first = { index: m.index, length: m[0].length, text: m[0] };
    }
    // Guard against zero-length matches looping forever.
    if (m.index === re.lastIndex) re.lastIndex += 1;
  }
  return { first, count };
}

function anyMatch(subject: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(subject));
}

/**
 * Run the full rule catalog over a submission.
 *
 * Order of operations per rule:
 *   1. `excludesAny` veto — a genuine safety advisory must never be reported
 *      as the thing it is warning about.
 *   2. count pattern hits, require `minMatches` (default 1).
 *   3. `requiresAny` corroboration — one generic word is never enough.
 *   4. optional dampening when only one hit occurred and the message contains
 *      legitimate-context language.
 */
export function scanRules(rawText: string): RuleScanResult {
  const normalized = normalizeForMatching(rawText);

  const legitimateContext = anyMatch(
    normalized,
    LEGITIMATE_CONTEXT_MARKERS,
  );

  const matches: RuleMatch[] = [];

  for (const rule of RULES) {
    const subject = rule.scanRaw ? rawText : normalized;

    if (rule.excludesAny && anyMatch(subject, rule.excludesAny)) continue;
    if (rule.requiresAny && !anyMatch(subject, rule.requiresAny)) continue;

    let total = 0;
    let first: Hit | null = null;
    for (const pattern of rule.patterns) {
      const { first: hit, count } = scan(subject, pattern);
      total += count;
      if (!first && hit) first = hit;
    }

    if (total < (rule.minMatches ?? 1)) continue;
    if (!first) continue;

    const evidence = rule.scanRaw
      ? excerptAt(rawText, first.index, first.length)
      : excerptAround(rawText, first.index, first.text);

    const dampened =
      total === 1 &&
      rule.severity === "low" &&
      Boolean(rule.reducesWhen ?? LEGITIMATE_CONTEXT_MARKERS) &&
      legitimateContext;

    matches.push({
      rule,
      count: total,
      evidence,
      weight: dampened ? Math.round(rule.weight / 2) : rule.weight,
      dampened,
      index: first.index,
    });
  }

  // Deterministic order: severity first, then the catalog's stable `order`.
  const severityRank: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  matches.sort(
    (a, b) =>
      severityRank[a.rule.severity] - severityRank[b.rule.severity] ||
      a.rule.order - b.rule.order ||
      a.index - b.index,
  );

  const maxSeverity =
    matches.length === 0
      ? null
      : matches.reduce<Severity>((acc, m) => {
          const rank: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
          return rank[m.rule.severity] < rank[acc] ? m.rule.severity : acc;
        }, "low");

  return {
    matches,
    rulesEvaluated: RULES.length,
    legitimateContext,
    maxSeverity,
  };
}
