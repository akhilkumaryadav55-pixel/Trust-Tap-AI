import type { Language, ResourceLink, RiskLevel } from "@/lib/types";
import type { RuleCategory } from "@/lib/analysis/rules/types";

/**
 * Official resource allowlist.
 *
 * This module is the ONLY source of external links TrustTap AI will display.
 * The AI is explicitly forbidden from supplying links, and any URL it does
 * return is discarded unless its host appears in `ALLOWED_RESOURCE_HOSTS`
 * (see `filterAiResources`). That makes it impossible for a model — or a
 * prompt-injection payload inside a user's message — to send someone to an
 * attacker-controlled "help" page.
 *
 * `lastVerified` must be updated whenever a link is checked. See
 * docs/SECURITY.md for the review procedure.
 */

export const RESOURCES_LAST_VERIFIED = "2026-10-13";

export type ResourceKind =
  | "financial_fraud"
  | "suspicious_communication"
  | "investment"
  | "identity_and_accounts"
  | "consumer"
  | "general";

export type OfficialResource = {
  id: string;
  title: { en: string; hi: string };
  url: string;
  /** Why a user would open this. */
  reason: { en: string; hi: string };
  kinds: ResourceKind[];
  /** Displayed on the Safety Center, in this order. */
  safetyCenterOrder?: number;
  /** Render as a call button rather than a web link. */
  action?: "call";
};

export const OFFICIAL_RESOURCES: OfficialResource[] = [
  {
    id: "helpline_1930",
    title: {
      en: "National cybercrime helpline — 1930",
      hi: "राष्ट्रीय साइबर अपराध हेल्पलाइन — 1930",
    },
    url: "tel:1930",
    reason: {
      en: "Call this immediately if money has already left your account. It is the fastest official route to freezing a fraudulent transaction.",
      hi: "अगर आपके खाते से पैसे जा चुके हैं तो तुरंत कॉल करें। ठगी वाली लेन-देन रोकने का सबसे तेज़ आधिकारिक रास्ता यही है।",
    },
    kinds: ["financial_fraud", "general"],
    safetyCenterOrder: 1,
    action: "call",
  },
  {
    id: "cybercrime_portal",
    title: {
      en: "National Cyber Crime Reporting Portal (cybercrime.gov.in)",
      hi: "राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (cybercrime.gov.in)",
    },
    url: "https://www.cybercrime.gov.in/",
    reason: {
      en: "File an official online complaint about cyber fraud, including financial fraud, with the Government of India.",
      hi: "भारत सरकार के पास साइबर ठगी, जिसमें वित्तीय ठगी भी शामिल है, की आधिकारिक ऑनलाइन शिकायत दर्ज करें।",
    },
    kinds: ["financial_fraud", "general"],
    safetyCenterOrder: 2,
  },
  {
    id: "sanchar_saathi",
    title: {
      en: "Sanchar Saathi (sancharsaathi.gov.in)",
      hi: "Sanchar Saathi (sancharsaathi.gov.in)",
    },
    url: "https://sancharsaathi.gov.in/",
    reason: {
      en: "Report a suspected fraud call or message, and check or block connections issued in your name.",
      hi: "संदिग्ध ठगी कॉल या संदेश की शिकायत करें, और अपने नाम पर जारी कनेक्शन जाँचें या ब्लॉक कराएँ।",
    },
    kinds: ["suspicious_communication", "general"],
    safetyCenterOrder: 3,
  },
  {
    id: "sachet_rbi",
    title: {
      en: "RBI Sachet — report unauthorised deposit-taking",
      hi: "RBI Sachet — अनधिकृत जमा योजना की शिकायत",
    },
    url: "https://sachet.rbi.org.in/",
    reason: {
      en: "Report a fake bank, unlicensed lender or unauthorised deposit scheme to the Reserve Bank of India.",
      hi: "नकली बैंक, बिना लाइसेंस वाले लोन देने वाले या अनधिकृत जमा योजना की शिकायत भारतीय रिज़र्व बैंक से करें।",
    },
    kinds: ["financial_fraud"],
    safetyCenterOrder: 4,
  },
  {
    id: "sebi_scores",
    title: {
      en: "SEBI SCORES — investment and trading complaints",
      hi: "SEBI SCORES — निवेश और ट्रेडिंग शिकायत",
    },
    url: "https://scores.sebi.gov.in/",
    reason: {
      en: "Complain about an unregistered investment adviser, tip group or promised-return scheme.",
      hi: "अपंजीकृत निवेश सलाहकार, टिप ग्रुप या रिटर्न के वादे वाली योजना की शिकायत करें।",
    },
    kinds: ["investment"],
    safetyCenterOrder: 5,
  },
  {
    id: "npci",
    title: {
      en: "NPCI — UPI and payment system help",
      hi: "NPCI — UPI और भुगतान प्रणाली सहायता",
    },
    url: "https://www.npci.org.in/",
    reason: {
      en: "Understand UPI rules, and find the correct grievance channel for a payment app.",
      hi: "UPI नियम समझें और भुगतान ऐप के लिए सही शिकायत माध्यम ढूँढें।",
    },
    kinds: ["financial_fraud"],
    safetyCenterOrder: 6,
  },
  {
    id: "consumer_helpline",
    title: {
      en: "National Consumer Helpline",
      hi: "राष्ट्रीय उपभोक्ता हेल्पलाइन",
    },
    url: "https://consumerhelpline.gov.in/",
    reason: {
      en: "For a fake online store, a paid-but-undelivered order, or a misleading offer.",
      hi: "नकली ऑनलाइन दुकान, पैसे लेकर डिलीवरी न होने, या भ्रामक ऑफ़र के लिए।",
    },
    kinds: ["consumer"],
    safetyCenterOrder: 7,
  },
  {
    id: "cert_in",
    title: {
      en: "CERT-In — national cybersecurity incident reporting",
      hi: "CERT-In — राष्ट्रीय साइबर सुरक्षा घटना रिपोर्टिंग",
    },
    url: "https://www.cert-in.org.in/",
    reason: {
      en: "Report a security incident such as a compromised account, malware or a data breach.",
      hi: "खाता हैक होने, मैलवेयर या डेटा चोरी जैसी सुरक्षा घटना की रिपोर्ट करें।",
    },
    kinds: ["identity_and_accounts", "general"],
    safetyCenterOrder: 8,
  },
  {
    id: "uidai",
    title: {
      en: "UIDAI — Aadhaar help and fraud reporting",
      hi: "UIDAI — आधार सहायता और ठगी रिपोर्टिंग",
    },
    url: "https://uidai.gov.in/",
    reason: {
      en: "Lock your Aadhaar biometrics, check authentication history, and report misuse.",
      hi: "अपना आधार बायोमेट्रिक लॉक करें, प्रमाणीकरण इतिहास देखें और दुरुपयोग की रिपोर्ट करें।",
    },
    kinds: ["identity_and_accounts"],
    safetyCenterOrder: 9,
  },
  {
    id: "incometax",
    title: {
      en: "Income Tax Department — official portal",
      hi: "आयकर विभाग — आधिकारिक पोर्टल",
    },
    url: "https://www.incometax.gov.in/",
    reason: {
      en: "Use this to check any tax notice, refund or PAN issue directly instead of a link in a message.",
      hi: "किसी टैक्स नोटिस, रिफ़ंड या पैन समस्या को संदेश के लिंक की जगह सीधे यहाँ जाँचें।",
    },
    kinds: ["identity_and_accounts", "financial_fraud"],
    safetyCenterOrder: 10,
  },
];

/** Hosts that may appear in a displayed resource link. */
export const ALLOWED_RESOURCE_HOSTS = new Set(
  OFFICIAL_RESOURCES.map((r) => {
    try {
      return new URL(r.url).host.toLowerCase();
    } catch {
      return "";
    }
  }).filter(Boolean),
);

export const ALLOWED_RESOURCE_ORIGINS = Array.from(ALLOWED_RESOURCE_HOSTS).map(
  (host) => `https://${host}`,
);

/**
 * Exact, canonical resource URLs (lowercased).
 *
 * Needed for non-HTTP schemes such as `tel:1930` that have no hostname. A
 * candidate is accepted when it matches one of these exactly, or when its host
 * is allowlisted.
 */
export const ALLOWED_RESOURCE_URLS = new Set(
  OFFICIAL_RESOURCES.map((r) => r.url.trim().toLowerCase()),
);

/**
 * Drop any AI-supplied resource whose URL is not on the allowlist.
 *
 * Called on every model response before it reaches the UI, so a hallucinated
 * or injected "official" link can never be shown.
 */
export function filterAiResources(candidates: { title: string; url: string; reason: string }[]): {
  accepted: ResourceLink[];
  rejected: string[];
} {
  const accepted: ResourceLink[] = [];
  const rejected: string[] = [];

  for (const candidate of candidates) {
    const normalized = candidate.url.trim().toLowerCase();

    // Exact match against our own catalog (covers tel:, and pins canonical paths).
    if (ALLOWED_RESOURCE_URLS.has(normalized)) {
      accepted.push({
        title: candidate.title,
        url: candidate.url,
        reason: candidate.reason,
      });
      continue;
    }

    let host: string;
    try {
      host = new URL(candidate.url).host.toLowerCase();
    } catch {
      rejected.push(candidate.url);
      continue;
    }
    if (host && ALLOWED_RESOURCE_HOSTS.has(host)) {
      accepted.push({
        title: candidate.title,
        url: candidate.url,
        reason: candidate.reason,
      });
    } else {
      rejected.push(candidate.url);
    }
  }
  return { accepted, rejected };
}

// --- Selection --------------------------------------------------------------

const MONEY_CATEGORIES: RuleCategory[] = [
  "payment_demand",
  "advance_fee",
  "prize",
];

const COMMS_CATEGORIES: RuleCategory[] = [
  "authority_impersonation",
  "account_threat",
  "link",
  "delivery",
  "job",
];

export type ResourceIntent =
  | "financial_loss"
  | "suspicious_communication"
  | "investment"
  | "identity"
  | "consumer"
  | "general";

export function resolveResourceIntent(input: {
  categories: RuleCategory[];
  riskLevel: RiskLevel;
  contentType?: string;
}): ResourceIntent {
  const { categories, riskLevel, contentType } = input;

  if (categories.includes("investment")) return "investment";
  if (
    categories.some((c) => MONEY_CATEGORIES.includes(c)) ||
    contentType === "banking_payment"
  ) {
    return riskLevel === "high" || riskLevel === "elevated"
      ? "financial_loss"
      : "suspicious_communication";
  }
  if (categories.includes("credential_request")) {
    return riskLevel === "high" ? "financial_loss" : "identity";
  }
  if (categories.some((c) => COMMS_CATEGORIES.includes(c))) {
    return "suspicious_communication";
  }
  return "general";
}

const INTENT_KINDS: Record<ResourceIntent, ResourceKind[]> = {
  financial_loss: ["financial_fraud", "general"],
  suspicious_communication: ["suspicious_communication", "financial_fraud"],
  investment: ["investment", "financial_fraud"],
  identity: ["identity_and_accounts", "financial_fraud"],
  consumer: ["consumer", "financial_fraud"],
  general: ["general"],
};

/**
 * Pick the resources relevant to a case, localised, most-urgent first.
 * Always returns at least one entry so the result screen is never a dead end.
 */
export function resolveResources(input: {
  language: Language;
  intent: ResourceIntent;
}): ResourceLink[] {
  const { language, intent } = input;
  const wanted = INTENT_KINDS[intent];

  const ranked = OFFICIAL_RESOURCES.filter((resource) =>
    resource.kinds.some((kind) => wanted.includes(kind)),
  ).sort(
    (a, b) => (a.safetyCenterOrder ?? 99) - (b.safetyCenterOrder ?? 99),
  );

  const chosen = ranked.length > 0 ? ranked : OFFICIAL_RESOURCES.slice(0, 2);

  return chosen.slice(0, 4).map((resource) => ({
    title: resource.title[language],
    url: resource.url,
    reason: resource.reason[language],
  }));
}
