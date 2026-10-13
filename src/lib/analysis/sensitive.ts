/**
 * Sensitive-value detection and redaction.
 *
 * TrustTap AI must never ask for, transmit or store passwords, OTPs, UPI PINs,
 * card numbers or government IDs. Users paste them anyway — so we detect them
 * defensively:
 *
 *   - the browser warns the user before submitting,
 *   - the server redacts before sending anything to an AI provider,
 *   - the stored preview and the content hash are computed from the REDACTED
 *     text, so a saved check can never leak a secret.
 *
 * Redaction is best-effort by design. It is a safety net, not a guarantee, and
 * the UI is honest about that.
 */

export type SensitiveCategory =
  | "otp"
  | "pin"
  | "card"
  | "password"
  | "government_id";

export type SensitiveHit = {
  category: SensitiveCategory;
  /** Number of distinct values found in this category. */
  count: number;
  /** Masked examples, safe to display (e.g. "•••• 1234"). */
  masked: string[];
};

export type SensitiveReport = {
  detected: boolean;
  hits: SensitiveHit[];
  categories: SensitiveCategory[];
  /** Input with every detected value replaced by a marker. */
  redacted: string;
};

const REDACTION_MARKER = "[redacted]";

/** Luhn checksum — cuts out random long numbers that are not card numbers. */
export function luhnValid(digits: string): boolean {
  if (!/^\d{11,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function mask(value: string, keep = 4): string {
  const tail = value.slice(-keep);
  return `${"•".repeat(Math.max(4, Math.min(8, value.length - keep)))}${tail}`;
}

type Detector = {
  category: SensitiveCategory;
  /** Applied to the raw text; must be global. */
  pattern: RegExp;
  /** Value-level validation. */
  validate?: (value: string) => boolean;
  /** Extract the actual secret from the match for masking. */
  pick?: (match: RegExpMatchArray) => string;
};

const DETECTORS: Detector[] = [
  {
    category: "card",
    // 13-19 digits, optionally separated by spaces or dashes.
    pattern: /\b(?:\d[ -]?){12,18}\d\b/g,
    validate: (v) => luhnValid(v.replace(/[ -]/g, "")),
    pick: (m) => m[0].replace(/[ -]/g, ""),
  },
  {
    category: "otp",
    // A 4-8 digit code that is explicitly described as an OTP or verification code.
    pattern:
      /(?:\b(?:otp|o\.t\.p|one[- ]?time\s+(?:password|code)|verification\s+code|security\s+code|ओटीपी)\b[^\d\n]{0,20}(\d{4,8}))|(?:(\d{4,8})[^\d\n]{0,20}\b(?:is\s+your|is\s+the|यह\s*आपका)\b[^\n]{0,20}\b(?:otp|o\.t\.p|one[- ]?time|verification|code|ओटीपी))/gi,
    pick: (m) => m[1] ?? m[2] ?? m[0],
  },
  {
    category: "pin",
    pattern:
      /\b(?:upi\s*pin|atm\s*pin|m?pin|पिन)\b[^\d\n]{0,20}(\d{4,6}|[•*·]{4,6})|(\d{4,6}|[•*·]{4,6})[^\d\n]{0,20}\b(?:is\s+your|यह\s*आपका)\b[^\n]{0,15}\b(?:pin|पिन)/gi,
    pick: (m) => m[1] ?? m[2] ?? m[0],
  },
  {
    category: "password",
    // Requires an explicit separator, so ordinary prose such as
    // "never share your password with anyone" is not mistaken for a secret.
    pattern:
      /\b(?:password|passwd|pwd|pass\s?code|पासवर्ड)\b\s*(?:is|:|=|है|-|–)\s*([^\s,;]{3,60})/gi,
    pick: (m) => m[1] ?? m[0],
    // Ignore placeholders and stopwords that follow a separator.
    validate: (v) =>
      !/^(reset|reset\.|change|change\.|expired|required|field|below|above|again|forgot|enter|your|the|and|or|is|was|not|never|with|to|for|from|by|has|have|must|will|can|anyone|kya|kaise|hai)$/i.test(
        v.trim(),
      ) && !/^[^\w]*$/.test(v),
  },
  {
    category: "government_id",
    // Aadhaar: 12 digits in 4-4-4 groups, first digit 2-9 (UIDAI's format).
    pattern: /\b([2-9]\d{3}[ ]\d{4}[ ]\d{4})\b/g,
    pick: (m) => m[1] ?? m[0],
  },
  {
    category: "government_id",
    // PAN: 5 letters, 4 digits, 1 letter.
    pattern: /\b([A-Z]{5}\d{4}[A-Z])\b/g,
    pick: (m) => m[1] ?? m[0],
  },
];

/**
 * Detect and redact sensitive values.
 *
 * Runs detectors in order (card before OTP so a card number is not partly
 * consumed as a code) and masks any overlap with an earlier match.
 */
export function detectAndRedact(input: string): SensitiveReport {
  const taken: Array<[number, number]> = [];
  const byCategory = new Map<SensitiveCategory, string[]>();
  let redacted = input;

  for (const detector of DETECTORS) {
    const re = new RegExp(detector.pattern.source, detector.pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(input)) !== null) {
      const start = m.index;
      const end = m.index + m[0].length;
      if (end <= start) continue;
      // Skip anything already consumed by a higher-priority detector.
      if (taken.some(([s, e]) => start < e && end > s)) continue;

      const value = (detector.pick ? detector.pick(m) : m[0]).trim();
      if (detector.validate && !detector.validate(value)) continue;
      if (!value) continue;

      taken.push([start, end]);
      const list = byCategory.get(detector.category) ?? [];
      list.push(mask(value, detector.category === "otp" ? 2 : 4));
      byCategory.set(detector.category, list);
    }
  }

  // Replace from the end so earlier indices stay valid.
  const ordered = [...taken].sort((a, b) => b[0] - a[0]);
  for (const [start, end] of ordered) {
    redacted = `${redacted.slice(0, start)}${REDACTION_MARKER}${redacted.slice(end)}`;
  }

  const hits: SensitiveHit[] = [...byCategory.entries()].map(
    ([category, masked]) => ({
      category,
      count: masked.length,
      masked,
    }),
  );

  return {
    detected: hits.length > 0,
    hits,
    categories: hits.map((h) => h.category),
    redacted,
  };
}

/** True when the text looks like it contains a secret. Cheap pre-check. */
export function looksSensitive(input: string): boolean {
  return detectAndRedact(input).detected;
}
