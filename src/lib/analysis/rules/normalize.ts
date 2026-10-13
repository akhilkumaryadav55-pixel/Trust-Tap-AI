/**
 * Text normalisation and safe evidence extraction.
 *
 * Two jobs:
 * 1. Normalise obfuscated input so patterns can match it (full-width digits,
 *    zero-width characters inserted to break keyword filters, Cyrillic
 *    homoglyphs standing in for Latin letters).
 * 2. Pull the *actual* matched substring back out of the user's original text
 *    so every finding shows real evidence. Nothing here ever generates text
 *    that was not in the submission.
 */

/** Invisible / bidi / zero-width characters, often used to evade filters. */
export const INVISIBLE_CHARS =
  /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\u00AD]/;

/** Cyrillic and Greek ranges — homoglyph source for Latin lookalikes. */
export const HOMOGLYPH_CHARS = /[\u0400-\u04FF\u0370-\u03FF]/;

/** Full-width ASCII forms (Ａ-Ｚ, ０-９ and full-width punctuation). */
export const FULLWIDTH_CHARS = /[\uFF01-\uFF5E]/;

/** Convert full-width characters to their ASCII equivalents. */
export function foldFullwidth(input: string): string {
  return input.replace(/[\uFF01-\uFF5E]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
  );
}

/** Replace common Cyrillic lookalikes with the Latin letters they imitate. */
const CYRILLIC_MAP: Record<string, string> = {
  "\u0430": "a",
  "\u0435": "e",
  "\u043e": "o",
  "\u0440": "p",
  "\u0441": "c",
  "\u0443": "y",
  "\u0445": "x",
  "\u0456": "i",
  "\u0455": "s",
  "\u04bb": "h",
  "\u0501": "d",
  "\u043a": "k",
  "\u043c": "m",
  "\u0442": "t",
  "\u0432": "b",
  "\u043d": "h",
};

function foldHomoglyphs(input: string): string {
  return input.replace(/[\u0370-\u04FF]/g, (ch) => CYRILLIC_MAP[ch] ?? ch);
}

/**
 * Normalise for pattern matching only. The original text is always used for
 * evidence excerpts and display, so normalisation can never alter what the
 * user is shown.
 */
export function normalizeForMatching(input: string): string {
  return foldHomoglyphs(foldFullwidth(input.normalize("NFC")))
    .replace(INVISIBLE_CHARS, "")
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .toLowerCase();
}

/** Collapse whitespace and cap length — used for previews and storage keys. */
export function condense(input: string, max = 240): string {
  const flat = input.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1)}…`;
}

/**
 * Extract a readable excerpt around a match in the ORIGINAL text.
 *
 * `normalizedIndex` is an index into the normalised string. Because
 * normalisation can change length (full-width folding is 1:1, but
 * zero-width removal is not), we first try the same offset and then verify by
 * searching for the matched fragment. If neither works we fall back to the
 * start of the text rather than inventing anything.
 */
export function excerptAround(
  original: string,
  normalizedIndex: number,
  normalizedMatch: string,
  radius = 70,
): string {
  const flat = original.replace(/\s+/g, " ").trim();

  // Preferred: locate the same fragment in the original text, case-insensitively.
  const needle = normalizedMatch.trim();
  let start = -1;
  if (needle.length >= 3) {
    start = flat.toLowerCase().indexOf(needle.toLowerCase());
  }
  // Fallback: trust the offset when normalisation was length-preserving.
  if (start === -1 && original.length === flat.length) {
    start = Math.max(0, normalizedIndex);
  }
  if (start === -1) {
    const fallbackEnd = Math.min(flat.length, radius * 2);
    return trimExcerpt(flat.slice(0, fallbackEnd), 0, fallbackEnd);
  }

  const from = Math.max(0, start - radius);
  const to = Math.min(flat.length, start + needle.length + radius);
  return trimExcerpt(flat.slice(from, to), from, to);
}

/**
 * Extract an excerpt at a known index in the ORIGINAL text.
 * Used for rules that scan raw input, where the match index is already in
 * original coordinates (normalisation would have removed the very characters
 * we are reporting).
 */
export function excerptAt(
  original: string,
  index: number,
  length: number,
  radius = 70,
): string {
  const start = Math.max(0, Math.min(index, Math.max(0, original.length - 1)));
  const from = Math.max(0, start - radius);
  const to = Math.min(original.length, start + Math.max(length, 1) + radius);
  return trimExcerpt(original.slice(from, to), from, to);
}

function trimExcerpt(slice: string, from: number, to: number): string {
  let out = slice.trim();
  if (from > 0) out = `…${out}`;
  if (to < Number.MAX_SAFE_INTEGER && !out.endsWith("…")) out = `${out}…`;
  return out.length > 220 ? `${out.slice(0, 219)}…` : out;
}

/**
 * Collect every URL-looking token from a string.
 * Deliberately conservative: we extract, we never fetch (see url.ts).
 */
export function extractUrls(input: string): string[] {
  const re =
    /(?:https?:\/\/|\bwww\.)[^\s<>"'()\[\]]+|\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|in|org|net|co|io|info|xyz|top|online|site|shop|app|live|club|buzz|link|click|icu|vip|win|bid|loan|work|biz|us|uk|ru|cn|to|cc|tk|ml|ga|cf|gq|dev|me|ly|be|it|de|fr|jp|au|ca)\b(?:\/[^\s<>"'()\[\]]*)?/gi;
  const found = input.match(re) ?? [];
  // Strip trailing punctuation that is almost never part of a URL.
  return Array.from(
    new Set(found.map((u) => u.replace(/[.,;:!?)\]}"']+$/, ""))),
  );
}
