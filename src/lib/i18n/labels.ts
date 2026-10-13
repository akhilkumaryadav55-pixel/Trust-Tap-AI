import type { ContentType, Language, RiskLevel, Severity } from "@/lib/types";

/**
 * Human labels for enum values. Kept next to the dictionaries but separate,
 * because these are keyed by stable identifiers from `lib/types` rather than
 * by screen.
 */
type Bi = { en: string; hi: string };

export const contentTypeLabels: Record<
  ContentType,
  { label: Bi; hint: Bi }
> = {
  sms: {
    label: { en: "SMS", hi: "एसएमएस" },
    hint: { en: "A text message", hi: "टेक्स्ट संदेश" },
  },
  whatsapp: {
    label: { en: "WhatsApp / messaging app", hi: "WhatsApp / मैसेजिंग ऐप" },
    hint: { en: "WhatsApp, Telegram, Signal…", hi: "WhatsApp, Telegram, Signal…" },
  },
  email: {
    label: { en: "Email", hi: "ईमेल" },
    hint: { en: "An email you received", hi: "आपको मिला ईमेल" },
  },
  job_offer: {
    label: { en: "Job or internship offer", hi: "नौकरी या इंटर्नशिप ऑफ़र" },
    hint: {
      en: "Recruitment, hiring, work-from-home",
      hi: "भर्ती, नियुक्ति, घर से काम",
    },
  },
  scholarship: {
    label: {
      en: "Scholarship or government benefit",
      hi: "छात्रवृत्ति या सरकारी लाभ",
    },
    hint: {
      en: "Scholarships, subsidies, scheme payouts",
      hi: "छात्रवृत्ति, सब्सिडी, योजना का पैसा",
    },
  },
  online_shopping: {
    label: { en: "Online shopping offer", hi: "ऑनलाइन शॉपिंग ऑफ़र" },
    hint: {
      en: "Sale, order, delivery or refund message",
      hi: "सेल, ऑर्डर, डिलीवरी या रिफ़ंड संदेश",
    },
  },
  banking_payment: {
    label: { en: "Banking or payment message", hi: "बैंक या भुगतान संदेश" },
    hint: {
      en: "KYC, account, UPI, card or loan",
      hi: "KYC, खाता, UPI, कार्ड या लोन",
    },
  },
  social_media: {
    label: { en: "Social media message", hi: "सोशल मीडिया संदेश" },
    hint: {
      en: "Instagram, Facebook, X, YouTube",
      hi: "Instagram, Facebook, X, YouTube",
    },
  },
  other: {
    label: { en: "Other or unknown", hi: "अन्य या अज्ञात" },
    hint: { en: "Not sure what it is", hi: "समझ नहीं आ रहा क्या है" },
  },
};

export const severityLabels: Record<Severity, Bi> = {
  high: { en: "High severity", hi: "उच्च गंभीरता" },
  medium: { en: "Medium severity", hi: "मध्यम गंभीरता" },
  low: { en: "Low severity", hi: "कम गंभीरता" },
};

/** Language display names, always shown in their own script. */
export const languageNames: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
};

/**
 * Ordered from most to least severe. Used for sorting findings so the most
 * important warning never ends up at the bottom of the list.
 */
export const riskLevelOrder: RiskLevel[] = [
  "high",
  "elevated",
  "caution",
  "unable_to_assess",
  "no_obvious_red_flags",
];

export const severityOrder: Severity[] = ["high", "medium", "low"];
