import type {
  Language,
  ReputationOutcome,
  RiskLevel,
  UrlReport,
} from "@/lib/types";
import type { Bi } from "./rules/types";
import type { RuleMatch } from "./rules/match";
import { MIN_USABLE_CHARS } from "./scoring";

/**
 * Deterministic, localised result composition.
 *
 * Every user-facing sentence in a result is produced here (not by the model),
 * except the summary itself, which the model may supply and which is validated
 * before use. That keeps refusal language, limitation wording and safety advice
 * stable and reviewable even when the AI layer is unavailable.
 */

const RISK_PHRASES: Record<RiskLevel, Bi> = {
  high: {
    en: "This content shows strong signs of a scam.",
    hi: "इस सामग्री में ठगी के मज़बूत संकेत हैं।",
  },
  elevated: {
    en: "This content contains several concerning signs.",
    hi: "इस सामग्री में कई चिंताजनक संकेत हैं।",
  },
  caution: {
    en: "This content has some potentially concerning signs.",
    hi: "इस सामग्री में कुछ संभावित चिंताजनक संकेत हैं।",
  },
  no_obvious_red_flags: {
    en: "Our checks did not find the major warning signs in this content.",
    hi: "हमारी जाँचों में इस सामग्री में बड़े चेतावनी संकेत नहीं मिले।",
  },
  unable_to_assess: {
    en: "There was not enough usable content to reach a reliable conclusion.",
    hi: "भरोसेमंद नतीजे के लिए पर्याप्त उपयोगी सामग्री नहीं थी।",
  },
};

const NO_SAFETY_GUARANTEE: Bi = {
  en: "This is not a statement that the content is safe: scams often show no obvious signs.",
  hi: "इसका अर्थ यह नहीं कि सामग्री सुरक्षित है: कई ठगियों में कोई साफ़ संकेत नहीं दिखता।",
};

/** Baseline advice that applies to every elevated or high result. */
const BASELINE_ACTIONS: Record<RiskLevel, Bi[]> = {
  high: [
    {
      en: "Do not reply, pay, click any link, or share any code or PIN.",
      hi: "जवाब न दें, भुगतान न करें, किसी लिंक पर क्लिक न करें, और कोई कोड या पिन साझा न करें।",
    },
    {
      en: "Verify through a channel you already trust: the official app, the number on your card or statement, or by typing the organisation's website yourself.",
      hi: "उसी भरोसेमंद माध्यम से पुष्टि करें जिसे आप पहले से जानते हैं: आधिकारिक ऐप, कार्ड या स्टेटमेंट पर दिया नंबर, या संस्था की वेबसाइट खुद टाइप करके।",
    },
    {
      en: "If money or an OTP has already been shared, act now — see the emergency steps.",
      hi: "अगर पैसे या OTP पहले ही साझा हो चुके हैं, तो तुरंत कदम उठाएँ — आपातकालीन कदम देखें।",
    },
  ],
  elevated: [
    {
      en: "Don't act on it yet. Confirm it with the organisation first using a contact detail you find yourself.",
      hi: "अभी कोई कदम न उठाएँ। पहले उस संस्था से उस संपर्क विवरण पर पुष्टि करें जो आप खुद ढूँढें।",
    },
    {
      en: "Never enter a password, OTP or UPI PIN into a page reached from a message.",
      hi: "संदेश से खुले पेज पर कभी पासवर्ड, OTP या UPI पिन न डालें।",
    },
  ],
  caution: [
    {
      en: "Treat this as unverified. Check the sender's real address or number before responding.",
      hi: "इसे असत्यापित मानें। जवाब देने से पहले भेजने वाले का असली पता या नंबर जाँचें।",
    },
  ],
  no_obvious_red_flags: [
    {
      en: "Stay careful anyway — check the sender, and pay or share details only through an app or site you opened yourself.",
      hi: "फिर भी सतर्क रहें — भेजने वाले की जाँच करें, और भुगतान या जानकारी केवल उसी ऐप या साइट से करें जिसे आपने खुद खोला हो।",
    },
  ],
  unable_to_assess: [
    {
      en: "Submit more of the message, or copy the text by hand, so we can analyse it properly.",
      hi: "संदेश का और हिस्सा भेजें, या टेक्स्ट हाथ से कॉपी करें, ताकि हम ठीक से जाँच सकें।",
    },
  ],
};

/** Advice that applies regardless of category. */
const UNIVERSAL_ACTIONS: Bi[] = [
  {
    en: "Keep screenshots, the sender's number, and any reference numbers, in case you need to report it.",
    hi: "स्क्रीनशॉट, भेजने वाले का नंबर और संदर्भ संख्याएँ संभालकर रखें, शिकायत करने की ज़रूरत पड़ सकती है।",
  },
];

const BASELINE_AVOID: Bi[] = [
  {
    en: "Never share an OTP, password, UPI PIN, CVV or full card number with anyone.",
    hi: "OTP, पासवर्ड, UPI पिन, CVV या पूरा कार्ड नंबर किसी को भी न बताएँ।",
  },
  {
    en: "Never install an app or share your screen because someone who contacted you asked you to.",
    hi: "किसी ने संपर्क करके कहा है इसलिए कोई ऐप इंस्टॉल न करें और न स्क्रीन साझा करें।",
  },
  {
    en: "Never pay a fee to receive money, a prize, a refund or a job.",
    hi: "पैसे, इनाम, रिफ़ंड या नौकरी पाने के लिए कभी शुल्क न दें।",
  },
];

function pick(bi: Bi | undefined, language: Language): string {
  if (!bi) return "";
  return bi[language];
}

export function composeSummary(input: {
  language: Language;
  riskLevel: RiskLevel;
  matches: RuleMatch[];
  aiSummary: string | null;
  unableReason: string | null;
}): string {
  const { language, riskLevel, matches, aiSummary, unableReason } = input;
  const parts: string[] = [pick(RISK_PHRASES[riskLevel], language)];

  if (riskLevel === "unable_to_assess") {
    if (unableReason) parts.push(unableReason);
    return parts.join(" ");
  }

  const topTitles = matches
    .slice(0, 3)
    .map((m) => `“${m.rule.title[language]}”`)
    .filter(Boolean);

  if (topTitles.length > 0) {
    parts.push(
      language === "hi"
        ? `मुख्य संकेत: ${topTitles.join(", ")}.`
        : `Main indicators: ${topTitles.join("; ")}.`,
    );
  }

  if (aiSummary && aiSummary.trim().length > 0) {
    parts.push(aiSummary.trim());
  }

  if (riskLevel === "no_obvious_red_flags") {
    parts.push(pick(NO_SAFETY_GUARANTEE, language));
  }

  return parts.join(" ");
}

export function composeActions(input: {
  language: Language;
  riskLevel: RiskLevel;
  matches: RuleMatch[];
  aiActions: string[];
}): string[] {
  const { language, riskLevel, matches, aiActions } = input;

  const out: string[] = [];
  const seen = new Set<string>();

  const push = (value: string) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key) || out.length >= 8) return;
    seen.add(key);
    out.push(value.trim());
  };

  // Rule-derived advice is the most specific, so it goes first.
  for (const match of matches) {
    const advice = match.rule.explanation[language];
    if (match.rule.severity === "high") push(advice);
  }

  for (const action of BASELINE_ACTIONS[riskLevel]) push(pick(action, language));
  for (const action of aiActions) push(action);
  for (const action of UNIVERSAL_ACTIONS) push(pick(action, language));

  return out;
}

export function composeActionsToAvoid(input: {
  language: Language;
  aiActionsToAvoid: string[];
}): string[] {
  const { language, aiActionsToAvoid } = input;
  const out: string[] = [];
  const seen = new Set<string>();

  const push = (value: string) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key) || out.length >= 6) return;
    seen.add(key);
    out.push(value.trim());
  };

  for (const action of BASELINE_AVOID) push(pick(action, language));
  for (const action of aiActionsToAvoid) push(action);

  return out;
}

export function composeUncertainties(input: {
  language: Language;
  riskLevel: RiskLevel;
  matches: RuleMatch[];
  aiUncertainties: string[];
  aiWarnings: string[];
  reputation: ReputationOutcome | null;
  urlReport?: UrlReport | null;
  truncated: boolean;
  usableLength: number;
}): string[] {
  const {
    language,
    riskLevel,
    matches,
    aiUncertainties,
    aiWarnings,
    reputation,
    urlReport,
    truncated,
    usableLength,
  } = input;

  const out: string[] = [];
  const seen = new Set<string>();
  const push = (value: string) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key) || out.length >= 6) return;
    seen.add(key);
    out.push(value.trim());
  };

  push(
    language === "hi"
      ? "TrustTap AI ठगी को बनाने वाले हर संकेत को नहीं पहचान सकता। संकेत न मिलना सुरक्षा की गारंटी नहीं है।"
      : "TrustTap AI cannot detect every scam indicator. Missing signs are not proof of safety.",
  );
  push(
    language === "hi"
      ? "हम यह पुष्टि नहीं करते कि संदेश वास्तव में किसने भेजा, या दिया गया नंबर, खाता या वेबसाइट असली है।"
      : "We did not verify who actually sent this, or whether any phone number, account or website mentioned is genuine.",
  );

  if (riskLevel !== "high" && riskLevel !== "unable_to_assess") {
    push(
      language === "hi"
        ? "पर्याप्त जानकारी न होने के कारण कोई चेतावनी संकेत छूट सकता है।"
        : "With limited context, some warning signs may be missing from this analysis.",
    );
  }

  if (truncated) {
    push(
      language === "hi"
        ? "आपकी सामग्री लंबी थी और उसे छोटा किया गया, इसलिए अंत का हिस्सा जाँच में शामिल नहीं है।"
        : "Your submission was long and was shortened, so the ending was not analysed.",
    );
  }

  if (usableLength > 0 && usableLength < MIN_USABLE_CHARS * 3) {
    push(
      language === "hi"
        ? "बहुत कम टेक्स्ट होने से नतीजा कमज़ोर है। पूरा संदेश जाँचने पर बेहतर नतीजा मिलेगा।"
        : "Very little text was provided, which weakens the conclusion. Analysing the full message would give a better result.",
    );
  }

  if (matches.length === 0) {
    push(
      language === "hi"
        ? "हमारी किसी भी नियम-जाँच ने संकेत नहीं दिया, इसलिए यह नतीजा \"संकेत नहीं मिले\" तक सीमित है।"
        : "None of our rule-based checks matched, so this result is limited to \"no signs detected\".",
    );
  }

  if (urlReport && !urlReport.reputation.checked) {
    push(
      language === "hi"
        ? "इस लिंक की कोई बाहरी प्रतिष्ठा जाँच नहीं हुई, इसलिए हम नहीं बता सकते कि यह पता किसी खतरा-सूची में है या नहीं।"
        : "No external reputation check was performed on this link, so we cannot say whether the address appears on any threat list.",
    );
  }
  if (reputation?.checked && reputation.verdict === "clean") {
    push(
      language === "hi"
        ? "प्रतिष्ठा जाँच में कोई रिकॉर्ड नहीं मिला, पर नई ठगी वाली साइटें लगातार बनती हैं — यह सुरक्षा का प्रमाण नहीं है।"
        : "The reputation check found no record, but new fraud sites appear constantly — this is not proof of safety.",
    );
  }

  for (const warning of aiWarnings) push(warning);
  for (const item of aiUncertainties) push(item);

  return out;
}
