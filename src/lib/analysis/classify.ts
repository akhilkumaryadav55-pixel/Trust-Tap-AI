import type { ContentType, Language } from "@/lib/types";
import { normalizeForMatching } from "./rules/normalize";

/**
 * Content classification and language detection.
 *
 * The user's explicit choice always wins — guessing over someone's stated
 * intent would be both wrong and annoying. Classification only fills in when
 * the user selected "Other or unknown", and the result screen reports which
 * case applied.
 */

type Classifier = { type: ContentType; patterns: RegExp[]; weight?: number };

const CLASSIFIERS: Classifier[] = [
  {
    type: "job_offer",
    patterns: [
      /(?:job|internship|hiring|vacancy|placement|recruit|resume|cv|salary|joining|employ|naukri|नौकरी|इंटर्नशिप|भर्ती|वेतन)/,
      /(?:hr team|human resource|shortlisted|selected for)/,
    ],
  },
  {
    type: "scholarship",
    patterns: [
      /(?:scholarship|stipend|fellowship|tuition|study abroad|छात्रवृत्ति|वजीफ़ा|शिक्षा सहायता)/,
      /(?:pm ?kisan|pmay|ayushman|mnrega|yojana|subsidy|dbt|सब्सिडी|योजना)/,
    ],
  },
  {
    type: "online_shopping",
    patterns: [
      /(?:order|parcel|courier|shipment|delivery|dispatch|refund|return|invoice|tracking|डिलीवरी|पार्सल|ऑर्डर|कूरियर)/,
      /(?:sale|discount|coupon|voucher|cashback|flipkart|amazon|myntra|meesho|ajio|सैल|छूट)/,
    ],
  },
  {
    type: "banking_payment",
    patterns: [
      /\b(?:kyc|upi|neft|imps|rtgs|ifsc|net ?banking|debit|credit|a\/c|account number|cvv|card|loan|emi|emi)\b/,
      /(?:केवाईसी|खाता|बैंक|लोन|कार्ड|भुगतान|लेनदेन|एटीएम)/,
      /(?:bank|banking|sbi|hdfc|icici|axis|kotak|paytm|phonepe|gpay|upi)/,
    ],
  },
  {
    type: "email",
    patterns: [
      /(?:from|to|subject|cc|bcc|sent|unsubscribe|dear sir|dear madam|regards|sincerely|इमेल)/,
    ],
  },
  {
    type: "social_media",
    patterns: [
      /(?:instagram|facebook|whatsapp|telegram|twitter|\bx\b|youtube|snapchat|linkedin|dm me|follow|सोशल मीडिया)/,
    ],
  },
  {
    type: "whatsapp",
    patterns: [
      /(?:whatsapp|wa\.me|forwarded many times|forward this|group|टेलीग्राम|व्हाट्सएप)/,
    ],
  },
  {
    type: "sms",
    patterns: [/(?:sms|text message|do not reply|short code|toll free)/],
  },
];

export type Classification = {
  /** The type used for the result. */
  contentType: ContentType;
  /** What the classifier would have chosen. */
  inferred: ContentType | null;
  /** True when the user's own selection was used. */
  userProvided: boolean;
};

export function classifyContent(
  rawText: string,
  userSelected: ContentType | undefined,
): Classification {
  const subject = normalizeForMatching(rawText);
  const scores = new Map<ContentType, number>();

  for (const classifier of CLASSIFIERS) {
    let hits = 0;
    for (const pattern of classifier.patterns) {
      if (pattern.test(subject)) hits += 1;
    }
    if (hits > 0) scores.set(classifier.type, hits);
  }

  let inferred: ContentType | null = null;
  let best = 0;
  for (const [type, hits] of scores) {
    if (hits > best) {
      best = hits;
      inferred = type;
    }
  }

  if (userSelected && userSelected !== "other") {
    return { contentType: userSelected, inferred, userProvided: true };
  }
  if (userSelected === "other" && inferred) {
    return { contentType: inferred, inferred, userProvided: true };
  }
  return { contentType: inferred ?? "other", inferred, userProvided: Boolean(userSelected) };
}

/**
 * Detects whether the submission is predominantly Hindi (Devanagari) or
 * English. Used to pick the analysis language when the caller did not specify
 * one, and to avoid running English-only heuristics on Devanagari text.
 */
export function detectLanguage(rawText: string): Language {
  const devanagari = rawText.match(/[\u0900-\u097F]/g)?.length ?? 0;
  const latin = rawText.match(/[A-Za-z]/g)?.length ?? 0;
  if (devanagari === 0 && latin === 0) return "en";
  return devanagari / (devanagari + latin) > 0.15 ? "hi" : "en";
}

/**
 * A submission that is only a link (or a link plus a few words) gets
 * URL-focused analysis instead of message analysis.
 */
export function looksUrlOnly(rawText: string): boolean {
  const trimmed = rawText.trim();
  if (!trimmed) return false;
  const withoutLabel = trimmed.replace(
    /^(?:check|is|this|link|url|address|ye|yeh|link\s*check)\s*[:\-]?\s*/i,
    "",
  );
  return /^(?:https?:\/\/\S+|www\.\S+)$/i.test(withoutLabel);
}
