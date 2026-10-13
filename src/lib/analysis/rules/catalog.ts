import type { Rule } from "./types";

/**
 * TrustTap AI rule catalog.
 *
 * Design rules every entry must follow:
 *
 * 1. **Never a single word.** A rule that fires on one generic word must either
 *    require a second pattern (`minMatches`) or require corroborating context
 *    (`requiresAny`). Legitimate messages say "urgent", "payment", "verify" and
 *    "KYC" constantly.
 * 2. **Vetoes beat matches.** `excludesAny` exists so genuine safety advisories
 *    ("never share your OTP") are not reported as OTP theft attempts.
 * 3. **Bilingual.** Every pattern set covers English, Hindi and the Hinglish
 *    people actually type. Relying on English keywords alone would miss most of
 *    the traffic this product exists to protect.
 * 4. **Explainable.** Each rule states why it matters in plain language, because
 *    the result screen must justify every warning it shows.
 * 5. **Stable ids.** Ids appear in saved results and docs/SCORING.md. Renaming
 *    one is a breaking change.
 *
 * Weights are points on a 0-100 indicative scale. See docs/SCORING.md for how
 * they aggregate and where the category thresholds sit.
 */

// --- Shared context vocabularies -------------------------------------------
// Reused by `requiresAny` guards so a rule cannot fire on a bare keyword.

const MONEY =
  /₹|rs\.?\s?\d|inr|rupees|रुपये|पैसे|राशि|amount|payment|pay\b|transfer|deposit|fee|charges?|शुल्क|फीस|भुगतान|जमा/;
const CREDENTIALS =
  /\botp\b|ओटीपी|\bpin\b|पिन|password|पासवर्ड|cvv|card|कार्ड|aadhaar|aadhar|आधार|\bpan\b|पैन|kyc|केवाईसी|account|खाता/;
const LINKY =
  /https?:\/\/|www\.|\.(?:com|in|net|org|xyz|top|online|site|shop|link|click|icu|vip|win|app|live|info|co)\b|click here|लिंक|क्लिक|\bapk\b/;
const THREAT =
  /block|blocked|suspend|close[d]?|freeze|legal|police|arrest|court|fine|penalty|action|deactivat|disconnect|terminat|बंद|निलंबित|गिरफ्तार|पुलिस|जुर्माना|कार्रवाई|ब्लॉक/;
const URGENCY =
  /urgent|immediately|today|expire|last chance|last date|hurry|act now|तुरंत|जल्दी|आज|समाप्त|अंतिम|फौरन/;
const PRIZE =
  /won|winner|lottery|prize|reward|gift|jackpot|selected|इनाम|लॉटरी|पुरस्कार|जीत|विजेता|बधाई/;
const JOB =
  /job|internship|hiring|vacancy|salary|recruit|placement|naukri|नौकरी|इंटर्नशिप|भर्ती|वेतन|नियुक्ति/;
const VERIFY =
  /verif|update|confirm|validate|suspend|link|complete|सत्यापित|अपडेट|पुष्टि|लिंक|पूरा/;
const SUSPICIOUS_CONTEXT = new RegExp(
  `(?:${URGENCY.source}|${THREAT.source}|${CREDENTIALS.source}|${LINKY.source}|${PRIZE.source}|${MONEY.source})`,
);

/**
 * Context that excludes urgency vocabulary.
 *
 * `urgency_pressure` must not be corroborated by its own words, otherwise a
 * guardrail build on SUSPICIOUS_CONTEXT would let "URGENT" satisfy the very
 * requirement it is supposed to enforce. Any rule that keys off urgency must
 * use this constant instead.
 */
const CONSEQUENCE_CONTEXT = new RegExp(
  `(?:${THREAT.source}|${CREDENTIALS.source}|${LINKY.source}|${PRIZE.source}|${MONEY.source}|${JOB.source})`,
);

export const RULES: Rule[] = [
  // ---------------------------------------------------------------- OTP / PIN
  {
    id: "otp_request",
    category: "credential_request",
    severity: "high",
    weight: 28,
    order: 1,
    title: {
      en: "Someone is asking you to share a one-time password",
      hi: "कोई आपसे वन-टाइम पासवर्ड साझा करने को कह रहा है",
    },
    explanation: {
      en: "A one-time password is the key to your account. No bank, company or government office ever needs it from you. Sharing it lets someone else complete transactions as you.",
      hi: "वन-टाइम पासवर्ड आपके खाते की चाबी है। कोई बैंक, कंपनी या सरकारी दफ़्तर कभी इसे आपसे नहीं माँगता। इसे बताने पर दूसरा व्यक्ति आपके नाम पर लेन-देन कर सकता है।",
    },
    patterns: [
      /(?:share|send|tell|give|forward|provide|reply with|enter|type|बताएँ|बताइए|साझा|भेजें|डालें)[^.!?\n]{0,45}(?:otp|o\.t\.p|one[- ]?time (?:password|code)|verification code|ओटीपी|वन टाइम)/,
      /(?:otp|o\.t\.p|one[- ]?time (?:password|code)|ओटीपी)[^.!?\n]{0,45}(?:share|send|tell|give|provide|forward|confirm|reply|बताएँ|बताइए|साझा|भेजें|पुष्टि)/,
      /(?:share|send|तुरंत)[^.!?\n]{0,25}(?:6[- ]?digit|six[- ]?digit)[^.!?\n]{0,25}(?:code|number|कोड)/,
    ],
    excludesAny: [
      /never\s+(?:share|disclose|give|reveal)/,
      /do\s?n[o']?t\s+(?:share|disclose|give|reveal)/,
      /will never ask/,
      /कभी\s*(?:साझा|बता)\s*न/,
      /साझा न करें/,
      /बताएँ नहीं/,
    ],
  },
  {
    id: "upi_pin_request",
    category: "credential_request",
    severity: "high",
    weight: 30,
    order: 2,
    title: {
      en: "A UPI or card PIN is being requested",
      hi: "UPI या कार्ड पिन माँगा जा रहा है",
    },
    explanation: {
      en: "Your UPI PIN authorises money leaving your account. It is never needed to receive money, claim a refund, or verify an identity.",
      hi: "आपका UPI पिन आपके खाते से पैसे निकलने को मंज़ूरी देता है। पैसे प्राप्त करने, रिफ़ंड लेने या पहचान सत्यापित करने के लिए यह कभी नहीं चाहिए।",
    },
    patterns: [
      /upi\s*(?:pin|पिन)|यूपीआई पिन/,
      /(?:enter|share|tell|send|provide|type|submit|डालें|बताएँ|साझा|भेजें)[^.!?\n]{0,30}(?:\bm?pin\b|पिन|एमपिन|atm pin)/,
      /(?:\bm?pin\b|atm pin|पिन)[^.!?\n]{0,30}(?:enter|share|send|tell|provide|confirm|verify|बताएँ|साझा|भेजें|डालें)/,
      /(?:अपना|your)[^.!?\n]{0,20}(?:upi\s*)?pin[^.!?\n]{0,20}(?: डालें|डालिए|enter)/,
    ],
    excludesAny: [
      /never\s+(?:share|disclose|enter)/,
      /do\s?n[o']?t\s+(?:share|disclose|enter)/,
      /कभी\s*साझा\s*न/,
    ],
  },
  {
    id: "credential_harvesting",
    category: "credential_request",
    severity: "medium",
    weight: 16,
    order: 3,
    title: {
      en: "Personal or banking details are being collected",
      hi: "निजी या बैंकिंग जानकारी माँगी जा रही है",
    },
    explanation: {
      en: "Real organisations do not collect account numbers, card numbers, CVV, Aadhaar or PAN over SMS, WhatsApp or a link they sent you.",
      hi: "असली संस्थाएँ खाता संख्या, कार्ड नंबर, CVV, आधार या पैन SMS, WhatsApp या भेजे गए लिंक से नहीं माँगतीं।",
    },
    patterns: [
      /(?:share|send|provide|update|confirm|verify|submit|भेजें|साझा|अपडेट|बताएँ)[^.!?\n]{0,45}(?:bank details|account (?:number|details)|card (?:number|details)|cvv|expiry (?:date|year)|debit card|credit card|aadhaar|aadhar|pan card|date of birth|खाता संख्या|कार्ड नंबर|आधार|पैन|जन्म तिथि)/,
      /(?:bank details|account (?:number|details)|card (?:number|details)|cvv|aadhaar|आधार|\bpan\b|खाता संख्या)[^.!?\n]{0,45}(?:share|send|provide|update|confirm|verify|भेजें|साझा|अपडेट)/,
      /(?:net\s?banking|internet banking|mobile banking|upi|phone ?pe|google ?pay)[^.!?\n]{0,35}(?:login|password|credential|क्रेडेंशियल|लॉगिन|पासवर्ड)/,
    ],
    excludesAny: [/never\s+(?:share|disclose)/, /कभी\s*साझा\s*न/],
  },

  // ------------------------------------------------------- account & threats
  {
    id: "account_closure_threat",
    category: "account_threat",
    severity: "high",
    weight: 22,
    order: 10,
    title: {
      en: "Threat that your account or service will be blocked",
      hi: "खाता या सेवा बंद होने की धमकी",
    },
    explanation: {
      en: "Threatening to close an account is a pressure tactic. Banks and telecom operators write formally and give you time — they do not create panic in a text message.",
      hi: "खाता बंद करने की धमकी दबाव डालने की तरकीब है। बैंक और टेलीकॉम कंपनियाँ औपचारिक रूप से लिखती हैं और समय देती हैं — वे संदेश में डर नहीं फैलातीं।",
    },
    patterns: [
      /account[^.!?\n]{0,35}(?:will be|has been|is|gets|may be)[^.!?\n]{0,25}(?:block|blocked|closed|suspend|freez|deactivat|terminat|locked|restricted)/,
      /(?:block|close|suspend|freeze|deactivat|terminat|lock|disconnect|bar)[^.!?\n]{0,30}(?:your|the|your)[^.!?\n]{0,25}(?:account|card|number|sim|connection|service|upi|wallet)/,
      /(?:sim|connection|number)[^.!?\n]{0,25}(?:will be|has been)[^.!?\n]{0,20}(?:disconnected|deactivated|discontinued|blocked)/,
      /खाता[^.!?\n]{0,35}(?:बंद|निलंबित|फ्रीज़|ब्लॉक)/,
      /(?:बंद|ब्लॉक|निलंबित|फ्रीज़)[^.!?\n]{0,25}(?:हो जाएगा|कर दिया जाएगा|हो जाएगी)/,
      /(?:सिम|कनेक्शन|नंबर)[^.!?\n]{0,25}(?:बंद|निलंबित)/,
    ],
  },
  {
    id: "digital_arrest_threat",
    category: "account_threat",
    severity: "high",
    weight: 28,
    order: 11,
    title: {
      en: "Fake police, customs or 'digital arrest' pressure",
      hi: "नकली पुलिस, सीमा शुल्क या 'डिजिटल अरेस्ट' का दबाव",
    },
    explanation: {
      en: "Indian police and government agencies do not conduct investigations over WhatsApp or video calls, and they never demand payment to avoid arrest. This is one of the most financially damaging scams in India.",
      hi: "भारतीय पुलिस और सरकारी एजेंसियाँ WhatsApp या वीडियो कॉल पर जाँच नहीं करतीं, और गिरफ्तारी से बचने के लिए पैसे नहीं माँगतीं। यह भारत की सबसे ज़्यादा नुकसान पहुँचाने वाली ठगियों में से है।",
    },
    patterns: [
      /digital arrest|डिजिटल अरेस्ट/,
      /(?:cbi|police|customs|narcotics|enforcement directorate|\bed\b|trai|income tax|cyber cell|साइबर सेल|पुलिस|आयकर)[^.!?\n]{0,60}(?:case|fir|arrest|summons|notice|penalty|fine|investigation|मामला|गिरफ्तार|नोटिस|जुर्माना|जाँच)/,
      /(?:case|fir|arrest|notice|मामला|गिरफ्तारी)[^.!?\n]{0,40}(?:against you|filed|registered|आपके खिलाफ|दर्ज)/,
      /(?:parcel|courier|package|पार्सल)[^.!?\n]{0,50}(?:illegal|drugs|contraband|narcotics|passport|weapons|अवैध|ड्रग्स|पासपोर्ट)/,
      /(?:aadhaar|आधार)[^.!?\n]{0,40}(?:misuse|used for|involved in|linked to)[^.!?\n]{0,30}(?:crime|illegal|case|fraud|अपराध|धोखा)/,
    ],
    minMatches: 1,
    excludesAny: [
      /never\s+pay/,
      /police do not|पुलिस कभी नहीं/,
      /report (?:such|these) calls/,
    ],
  },
  {
    id: "legal_or_credit_threat",
    category: "account_threat",
    severity: "medium",
    weight: 15,
    order: 12,
    title: {
      en: "Threat of legal action, a fine or a credit-score penalty",
      hi: "कानूनी कार्रवाई, जुर्माना या क्रेडिट स्कोर पर असर की धमकी",
    },
    explanation: {
      en: "Real legal notices arrive in writing. Threats of an FIR, a fine or a CIBIL hit inside a message are used to make you act before you think.",
      hi: "असली कानूनी नोटिस लिखित में आते हैं। संदेश के अंदर FIR, जुर्माना या CIBIL पर असर की धमकी आपसे जल्दबाज़ी कराने के लिए होती है।",
    },
    patterns: [
      /(?:fine|penalty|legal action|lawyer|court|police complaint|fir|blacklist|credit (?:score|bureau)|cibil|defaulter|warrant|गिरफ्तारी वारंट|जुर्माना|कानूनी कार्रवाई|मुकदमा|काली सूची)[^.!?\n]{0,50}/,
      /(?:court|legal)[^.!?\n]{0,30}(?:case|notice|action|proceeding|केस|नोटिस|कार्रवाई)/,
    ],
    requiresAny: [SUSPICIOUS_CONTEXT],
    minMatches: 2,
  },

  // ------------------------------------------------------------- urgency etc
  {
    id: "urgency_pressure",
    category: "urgency",
    severity: "medium",
    weight: 14,
    order: 20,
    title: {
      en: "Artificial urgency to make you act fast",
      hi: "जल्दबाज़ी कराने के लिए बनाया गया दबाव",
    },
    explanation: {
      en: "Deadlines measured in minutes or hours are designed to stop you from checking. Genuine organisations accept that you may take time to respond.",
      hi: "मिनटों या घंटों की समय सीमा इसलिए दी जाती है ताकि आप जाँच न कर सकें। असली संस्थाएँ आपको जवाब देने का समय देती हैं।",
    },
    patterns: [
      /within \d{1,2}\s*(?:minutes?|mins?|hours?|hrs?|घंटे|मिनट)/,
      /\burgent(?:ly)?\b|अत्यंत आवश्यक|अति आवश्यक/,
      /\bimmediate(?:ly)?\b|तुरंत|फौरन/,
      /(?:last|final)\s+(?:date|chance|day|warning|reminder)|आख़िरी|अंतिम\s*(?:तारीख|चेतावनी|मौका)/,
      /(?:expir|expires|expiring|expiry)|समाप्त हो रहा|समाप्ति/,
      /today only|only today|आज ही|सिर्फ़ आज/,
      /act now|hurry up|जल्दी करें|जल्दी कीजिए/,
    ],
    requiresAny: [CONSEQUENCE_CONTEXT],
  },
  {
    id: "secrecy_pressure",
    category: "secrecy",
    severity: "high",
    weight: 24,
    order: 21,
    title: {
      en: "You are being told to keep this secret",
      hi: "आपसे यह बात गुप्त रखने को कहा जा रहा है",
    },
    explanation: {
      en: "Asking you not to tell family, bank staff or police exists only to stop someone from talking you out of it. A legitimate request never needs secrecy.",
      hi: "परिवार, बैंक कर्मचारी या पुलिस को न बताने की बात केवल इसलिए कही जाती है ताकि कोई आपको रोक न सके। असली माँग में गोपनीयता की ज़रूरत नहीं होती।",
    },
    patterns: [
      /do\s?n[o']?t\s+(?:tell|inform|share with|discuss|disclose|mention)/,
      /keep (?:this|it|everything)\s+(?:a\s+)?(?:secret|confidential|between us|to yourself)/,
      /(?:without|before)\s+telling\s+(?:anyone|your|the)/,
      /किसी को (?:न बताएँ|न बताएं|मत बताओ|मत बताना)/,
      /गुप्त रखें|गोपनीय रखें|अपने तक रखें|बीच की बात/,
      /(?:family|bank|police)\s*(?:को)?\s*(?:न बताएँ|मत बताओ)/,
    ],
  },

  // ----------------------------------------------------------------- payment
  {
    id: "advance_fee_request",
    category: "advance_fee",
    severity: "high",
    weight: 22,
    order: 30,
    title: {
      en: "A fee is demanded before you receive anything",
      hi: "कुछ पाने से पहले शुल्क माँगा जा रहा है",
    },
    explanation: {
      en: "Processing, registration, clearance or 'refundable' fees are the core of most Indian online fraud. Money that must be paid first to unlock money is almost always gone.",
      hi: "प्रोसेसिंग, रजिस्ट्रेशन, क्लीयरेंस या 'वापस मिलने वाला' शुल्क भारत की ज़्यादातर ऑनलाइन ठगी की जड़ है। पहले पैसे देकर बाद में पैसे पाने का वादा आमतौर पर झूठा होता है।",
    },
    patterns: [
      /(?:processing|registration|refundable|security|onboarding|training|documentation|verification|activation|handling|shipping|customs|clearance|agent|service|delivery|convenience)\s+(?:fee|charge|charges|deposit|amount)/,
      /(?:प्रोसेसिंग|रजिस्ट्रेशन|रिफंडेबल|सिक्योरिटी|ट्रेनिंग|दस्तावेज़|सत्यापन|एक्टिवेशन)\s*(?:शुल्क|फीस|राशि|जमा)/,
      /small\s+(?:fee|charge|amount)/,
      /(?:pay|send|transfer|deposit|भेजें|जमा करें|भुगतान करें)[^.!?\n]{0,35}(?:fee|charge|deposit|शुल्क|फीस|राशि)/,
    ],
    excludesAny: [
      /no\s+(?:processing|registration|hidden)\s+(?:fee|charge)/,
      /कोई शुल्क नहीं/,
      /free of cost|bilkul free|बिल्कुल मुफ़्त/,
    ],
  },
  {
    id: "prize_claim_fee",
    category: "advance_fee",
    severity: "high",
    weight: 22,
    order: 31,
    title: {
      en: "A payment is required to release a prize or refund",
      hi: "इनाम या रिफ़ंड पाने के लिए भुगतान माँगा जा रहा है",
    },
    explanation: {
      en: "You never have to pay to receive a genuine prize, refund, subsidy or benefit. This is the most reliable single indicator of a payout scam.",
      hi: "असली इनाम, रिफ़ंड, सब्सिडी या लाभ पाने के लिए आपको कभी पैसे देने नहीं पड़ते। यह पैसा ऐंठने वाली ठगी का सबसे भरोसेमंद संकेत है।",
    },
    patterns: [
      /(?:claim|receive|release|collect|get)[^.!?\n]{0,45}(?:fee|charge|payment|deposit|transfer|शुल्क|फीस|राशि|भुगतान|जमा)/,
      /(?:pay|send|transfer)[^.!?\n]{0,35}(?:to (?:claim|receive|release|collect)|for (?:claiming|releasing|receiving))/,
      /(?:इनाम|पुरस्कार|राशि|रिफ़ंड)[^.!?\n]{0,35}(?:पाने|प्राप्त करने|लेन)[^.!?\n]{0,25}(?:भुगतान|शुल्क|जमा|पैसे)/,
      /(?:gst|tds|tax|duty|clearance)[^.!?\n]{0,35}(?:must be paid|to be paid|pay|deposit|भुगतान|जमा)/,
    ],
  },
  {
    id: "gift_card_or_crypto_payment",
    category: "payment_demand",
    severity: "high",
    weight: 26,
    order: 32,
    title: {
      en: "Payment by gift card or cryptocurrency is requested",
      hi: "गिफ्ट कार्ड या क्रिप्टोकरेंसी से भुगतान माँगा जा रहा है",
    },
    explanation: {
      en: "Gift-card codes and crypto transfers are requested because they cannot be reversed or traced back. No legitimate tax office, employer, bank or utility bills this way.",
      hi: "गिफ्ट कार्ड कोड और क्रिप्टो ट्रांसफ़र इसलिए माँगे जाते हैं क्योंकि इन्हें वापस नहीं पाया जा सकता। कोई असली विभाग, नियोक्ता, बैंक या सेवा ऐसा भुगतान नहीं माँगती।",
    },
    patterns: [
      /gift ?card|गिफ्ट कार्ड/,
      /(?:itunes|google play|amazon|steam|apple)\s*(?:gift ?card|voucher|code)/,
      /bitcoin|btc\b|usdt|tether|ethereum|\beth\b|crypto(?:currency)?|binance|trc20|erc20|wallet address|क्रिप्टो|बिटकॉइन/,
      /(?:western union|moneygram|wire transfer|hawala|वेस्टर्न यूनियन)/,
    ],
    requiresAny: [new RegExp(`(?:${MONEY.source}|${LINKY.source}|send|transfer|pay|code|भेजें|भुगतान)`)],
  },
  {
    id: "payment_request_approval",
    category: "payment_demand",
    severity: "high",
    weight: 20,
    order: 33,
    title: {
      en: "Approving a request or entering a PIN to 'receive' money",
      hi: "पैसे 'लेने' के लिए अनुरोध स्वीकारने या पिन डालने को कहा जा रहा है",
    },
    explanation: {
      en: "On UPI, entering your PIN or approving a collect request always SENDS money — it never receives it. This misunderstanding is behind a large share of UPI losses.",
      hi: "UPI में पिन डालना या collect अनुरोध स्वीकारना हमेशा पैसे भेजता है — कभी प्राप्त नहीं करता। यही भ्रम बड़ी संख्या में UPI नुकसान की वजह है।",
    },
    patterns: [
      /(?:approve|accept|authorise|authorize|enter (?:your )?(?:upi )?(?:pin|पिन)|scan)[^.!?\n]{0,35}(?:request|collect|payment|mandate|अनुरोध|भुगतान)/,
      /(?:collect request|upi (?:request|mandate)|payment request|money request|अनुरोध)/,
      /(?:receive|get|प्राप्त|पाने)[^.!?\n]{0,30}(?:money|payment|refund|amount|पैसे|राशि|रिफ़ंड)[^.!?\n]{0,35}(?:enter|approve|accept|pin|scan|डालें|स्वीकार|स्कैन)/,
      /(?:swipe|tap|enter)[^.!?\n]{0,25}(?:to receive|to get refund|पाने के लिए)/,
    ],
    excludesAny: [
      /never\s+(?:enter|approve|share)[^.!?\n]{0,20}(?:pin|request)/,
      /पिन कभी न/,
    ],
  },
  {
    id: "unexpected_payment_demand",
    category: "payment_demand",
    severity: "medium",
    weight: 16,
    order: 34,
    title: {
      en: "An unexpected payment is being demanded",
      hi: "अचानक भुगतान की माँग की जा रही है",
    },
    explanation: {
      en: "A payment you were not expecting, with no verifiable order, bill or contract behind it, is worth checking directly with the real company before paying.",
      hi: "जिस भुगतान की आपको उम्मीद नहीं थी, और जिसके पीछे कोई सत्यापित ऑर्डर, बिल या अनुबंध नहीं है, उसे भरने से पहले असली कंपनी से सीधे पुष्टि करें।",
    },
    patterns: [
      /(?:pay|payment|transfer|deposit|remit|clear|settle|भुगतान|जमा|भेजें)[^.!?\n]{0,40}(?:immediately|now|today|urgently|within|तुरंत|आज|जल्द)/,
      /(?:outstanding|pending|due|overdue|unpaid|बकाया)[^.!?\n]{0,35}(?:amount|payment|dues|bill|balance|राशि|भुगतान)/,
      /(?:pay|भुगतान)[^.!?\n]{0,30}(?:₹|rs\.?|inr|रुपये)[^.!?\n]{0,20}\d/,
      /(?:minimum|full)\s+(?:amount|payment|due)/,
    ],
    requiresAny: [new RegExp(`(?:${LINKY.source}|${THREAT.source}|${URGENCY.source}|${MONEY.source})`)],
  },
  {
    id: "refund_or_overpayment_trick",
    category: "payment_demand",
    severity: "medium",
    weight: 16,
    order: 35,
    title: {
      en: "Refund or 'extra money credited' story",
      hi: "रिफ़ंड या 'ज़्यादा पैसे जमा हो गए' की कहानी",
    },
    explanation: {
      en: "A common trick is to claim money was sent to you by mistake, then have you 'return' it or scan a code — which actually sends your own money out.",
      hi: "आम तरकीब है: कहना कि गलती से आपके खाते में पैसे आ गए, फिर आपसे वापस भेजने या कोड स्कैन करने को कहना — जिससे असल में आपके पैसे चले जाते हैं।",
    },
    patterns: [
      /(?:refund|cashback|overpaid|extra amount|wrong(?:ly)? (?:credited|transferred)|excess (?:amount|payment)|रिफ़ंड|वापसी|गलती से)[^.!?\n]{0,60}/,
      /(?:credited|transferred|भेजा गया)[^.!?\n]{0,30}(?:by mistake|wrongly|गलती से)/,
    ],
    requiresAny: [new RegExp(`(?:${LINKY.source}|scan|qr|upi|क्यूआर|call|share|साझा)`)],
  },
  {
    id: "qr_code_payment_pressure",
    category: "payment_demand",
    severity: "medium",
    weight: 16,
    order: 36,
    title: {
      en: "You are asked to scan a QR code",
      hi: "आपसे QR कोड स्कैन करने को कहा जा रहा है",
    },
    explanation: {
      en: "Scanning a QR code and entering a PIN sends money. QR codes received from a stranger, or for 'receiving' a payment, are a direct route to loss.",
      hi: "QR कोड स्कैन करके पिन डालने से पैसे चले जाते हैं। किसी अजनबी से मिला QR कोड, या 'पैसे लेने' के लिए दिया गया कोड, सीधे नुकसान का रास्ता है।",
    },
    patterns: [
      /(?:scan|स्कैन)[^.!?\n]{0,25}(?:qr|क्यूआर|code|कोड)/,
      /qr code|क्यूआर कोड/,
      /(?:scan and pay|scan to receive|स्कैन करके भुगतान)/,
    ],
    requiresAny: [new RegExp(`(?:${MONEY.source}|pay|payment|refund|receive|send|भुगतान|पैसे|रिफ़ंड)`)],
  },

  // -------------------------------------------------------------------- job
  {
    id: "recruitment_fee",
    category: "job",
    severity: "high",
    weight: 22,
    order: 40,
    title: {
      en: "You must pay to get a job or internship",
      hi: "नौकरी या इंटर्नशिप पाने के लिए पैसे देने को कहा जा रहा है",
    },
    explanation: {
      en: "Employers pay you; you never pay an employer, recruiter or consultancy to be hired. Security deposits and registration fees for jobs in India are almost always fraudulent.",
      hi: "नियोक्ता आपको पैसे देता है; नौकरी दिलाने के लिए आप कभी नियोक्ता, भर्तीकर्ता या कंसल्टेंसी को पैसे नहीं देते। भारत में नौकरी के नाम पर सिक्योरिटी डिपॉज़िट या रजिस्ट्रेशन फीस लगभग हमेशा ठगी होती है।",
    },
    patterns: [
      /(?:job|internship|placement|hiring|joining|offer letter|employment|recruitment|नौकरी|इंटर्नशिप|भर्ती|नियुक्ति)[^.!?\n]{0,70}(?:pay|fee|charge|deposit|registration|security amount|refundable|शुल्क|फीस|जमा|रजिस्ट्रेशन|डिपॉज़िट)/,
      /(?:pay|fee|deposit|charge|शुल्क|फीस)[^.!?\n]{0,45}(?:for (?:the )?(?:job|internship|placement|joining|offer)|नौकरी|इंटर्नशिप)/,
      /(?:security|refundable)\s+deposit[^.!?\n]{0,40}(?:job|work|employment|company|नौकरी)/,
      /(?:training|onboarding)\s+(?:fee|charge|kit)[^.!?\n]{0,30}(?:job|work|joining)/,
      // Often the job and the fee sit in different sentences; allow a sentence
      // boundary but require a fee word that is specific to recruitment.
      /(?:job|internship|joining|offer letter|employment|placement|नौकरी|इंटर्नशिप|भर्ती)[\s\S]{0,90}(?:registration|security|refundable|processing|training|documentation|onboarding)\s*(?:fee|charge|deposit|amount|शुल्क|फीस|जमा|डिपॉज़िट)/,
      /(?:registration|security|refundable|processing|training|documentation|onboarding)\s*(?:fee|charge|deposit|amount|शुल्क|फीस|जमा|डिपॉज़िट)[\s\S]{0,90}(?:job|internship|joining|offer letter|employment|placement|नौकरी|इंटर्नशिप|भर्ती|position)/,
    ],
  },
  {
    id: "too_good_to_be_true_pay",
    category: "job",
    severity: "medium",
    weight: 15,
    order: 41,
    title: {
      en: "Unrealistic pay with no interview or experience",
      hi: "बिना इंटरव्यू या अनुभव के अवास्तविक वेतन",
    },
    explanation: {
      en: "Very large daily earnings for simple tasks, with no interview, is a hallmark of task and job frauds. Real employers verify candidates before paying them.",
      hi: "आसान काम के लिए बहुत बड़ी रोज़ की कमाई, और कोई इंटरव्यू नहीं — यह टास्क और नौकरी ठगी की पहचान है। असली नियोक्ता नौकरी से पहले उम्मीदवार की जाँच करते हैं।",
    },
    patterns: [
      /(?:earn|make|salary|income|get paid|कमाएँ|कमाएं)[^.!?\n]{0,35}(?:₹|rs\.?|inr|usd|\$|रुपये)\s?\d{4,}/,
      /(?:₹|rs\.?|रुपये)\s?\d{4,}[^.!?\n]{0,25}(?:per day|daily|per hour|weekly|प्रति दिन|रोज़|हर दिन)/,
      /no\s+(?:experience|interview|qualification|skills?)\s+(?:required|needed|necessary)/,
      /guaranteed\s+(?:income|salary|job|placement|returns?)/,
      /(?:बिना|बगैर)\s+(?:अनुभव|इंटरव्यू|योग्यता)/,
      /(?:प्रति दिन|रोज़|हर दिन)[^.!?\n]{0,20}(?:₹|रुपये)\s?\d{3,}/,
    ],
  },
  {
    id: "data_entry_or_task_fraud",
    category: "job",
    severity: "medium",
    weight: 14,
    order: 42,
    title: {
      en: "Task, like-and-earn or data-entry offer",
      hi: "टास्क, लाइक-एंड-अर्न या डेटा-एंट्री ऑफ़र",
    },
    explanation: {
      en: "Being paid to like videos, review hotels or complete simple tasks is a well-known fraud format: small payouts build trust, then you are asked to deposit a larger 'investment'.",
      hi: "वीडियो लाइक करने, होटल रिव्यू या आसान काम के लिए भुगतान एक प्रसिद्ध ठगी है: पहले छोटी रकम दी जाती है, फिर बड़ा 'निवेश' जमा कराया जाता है।",
    },
    patterns: [
      /(?:like|review|subscribe|rate|share|task|data entry|typing|copy paste|टाइपिंग|डेटा एंट्री)[^.!?\n]{0,35}(?:earn|paid|payment|money|₹|कमाएँ|भुगतान|पैसे)/,
      /(?:telegram|whatsapp)[^.!?\n]{0,30}(?:task|job|earn|part time|कमाई|पार्ट टाइम)/,
      /part[\s-]?time[^.!?\n]{0,30}(?:earn|income|₹|कमाई|आय)/,
      /(?:per task|each task|प्रति टास्क)/,
    ],
  },
  {
    id: "unsolicited_job_offer",
    category: "job",
    severity: "low",
    weight: 8,
    order: 43,
    title: {
      en: "Unexpected job offer on a messaging app",
      hi: "मैसेजिंग ऐप पर अचानक नौकरी का ऑफ़र",
    },
    explanation: {
      en: "You cannot be hired by a company you never applied to. Verify the company's official careers page and email domain before responding.",
      hi: "जिस कंपनी में आपने आवेदन ही नहीं किया, वह आपको नौकरी नहीं दे सकती। जवाब देने से पहले कंपनी का आधिकारिक करियर पेज और ईमेल डोमेन जाँचें।",
    },
    patterns: [
      /(?:congratulations|selected|shortlisted|chosen)[^.!?\n]{0,45}(?:job|position|role|offer|internship|नौकरी|पद|इंटर्नशिप)/,
      /(?:we|our company|hr team|hiring team)[^.!?\n]{0,30}(?:found your|selected your|reviewed your)[^.!?\n]{0,25}(?:profile|resume|cv)/,
      /(?:no interview|direct joining|immediate joining|तुरंत जॉइनिंग|बिना इंटरव्यू)/,
    ],
    requiresAny: [JOB],
  },

  // ------------------------------------------------------------ impersonation
  {
    id: "authority_impersonation",
    category: "authority_impersonation",
    severity: "high",
    weight: 20,
    order: 50,
    title: {
      en: "Claims to be from an authority or government department",
      hi: "सरकारी विभाग या अधिकारी होने का दावा",
    },
    explanation: {
      en: "Government departments publish notices and use official portals. They do not ask you to settle a matter over a messaging app or private link.",
      hi: "सरकारी विभाग नोटिस जारी करते हैं और आधिकारिक पोर्टल का उपयोग करते हैं। वे मैसेजिंग ऐप या निजी लिंक पर मामला नहीं निपटाते।",
    },
    patterns: [
      /(?:income tax|gst department|cbi|police|cyber ?cell|trai|\brbi\b|reserve bank|customs|narcotics|enforcement directorate|\bed\b|court|uidai|epfo|passport office|municipal|government of india|govt\.? of india|आयकर|पुलिस|साइबर सेल|सरकार|न्यायालय|आरबीआई|uidai|epfo)/,
      /(?:income tax|gst|customs|police|court)[^.!?\n]{0,30}(?:department|officer|notice|summons|विभाग|अधिकारी|नोटिस)/,
    ],
    requiresAny: [
      new RegExp(
        `(?:${VERIFY.source}|${THREAT.source}|${MONEY.source}|notice|case|due|outstanding|penalty|fine|refund|नोटिस|मामला|जुर्माना|बकाया)`,
      ),
    ],
  },
  {
    id: "brand_impersonation",
    category: "authority_impersonation",
    severity: "medium",
    weight: 15,
    order: 51,
    title: {
      en: "Calls itself a major bank or service you may not use",
      hi: "किसी बड़े बैंक या सेवा का नाम इस्तेमाल करना",
    },
    explanation: {
      en: "Impersonating a well-known brand is cheap and effective. Check the sender's actual address or number, and open the company's real app yourself instead of a link from the message.",
      hi: "जानी-मानी कंपनी का नाम इस्तेमाल करना आसान और असरदार होता है। संदेश में दिए लिंक की जगह कंपनी का असली ऐप खुद खोलें, और भेजने वाले का असली नंबर या पता जाँचें।",
    },
    patterns: [
      /\b(?:sbi|state bank of india|hdfc|icici|axis bank|kotak|punjab national bank|\bpnb\b|bank of baroda|canara bank|union bank|idfc|yes bank|paytm|phonepe|google pay|gpay|amazon|flipkart|myntra|ajio|netflix|airtel|jio|vodafone|\bvi\b|bsnl|irctc|meesho|swiggy|zomato|blinkit|zepto|tata neu|epfo|uidai)\b/,
      /(?:आपका|your)\s+(?:sbi|hdfc|icici|axis|kotak|paytm|phonepe|airtel|jio)\s+(?:account|खाता|number|नंबर)/,
    ],
    requiresAny: [
      /verif|update|kyc|suspend|block|login|click|password|otp|refund|reward|cashback|expir|winner|prize|link|due|penalty|cancel|verify|अपडेट|सत्यापित|बंद|लिंक|इनाम|बकाया/,
    ],
  },
  {
    id: "fake_customer_care_number",
    category: "authority_impersonation",
    severity: "medium",
    weight: 15,
    order: 52,
    title: {
      en: "A customer-care or helpline number is offered directly",
      hi: "सीधे कस्टमर केयर या हेल्पलाइन नंबर दिया जा रहा है",
    },
    explanation: {
      en: "Fraudulent 'customer care' numbers posted in messages and search results take over your account or install remote-access apps. Always get the number from the company's official app, statement or website you type yourself.",
      hi: "संदेशों में दिए नकली 'कस्टमर केयर' नंबर आपका खाता कब्ज़े में ले लेते हैं या रिमोट-एक्सेस ऐप इंस्टॉल करा देते हैं। नंबर हमेशा कंपनी के आधिकारिक ऐप, स्टेटमेंट या खुद टाइप की गई वेबसाइट से लें।",
    },
    patterns: [
      /(?:customer ?care|helpline|toll ?free|support (?:number|team)|ग्राहक सेवा|हेल्पलाइन)[^.!?\n]{0,40}(?:\+?91[-\s]?\d{5}[-\s]?\d{5}|\b\d{10}\b|\b1800[-\s]?\d{3}[-\s]?\d{3,4}\b)/,
      /(?:call|contact|dial|कॉल)[^.!?\n]{0,25}(?:this|our|the)\s+(?:number|helpline|support)/,
      /(?:\+?91[-\s]?\d{5}[-\s]?\d{5}|\b\d{10}\b)[^.!?\n]{0,30}(?:for (?:help|support|refund|complaint)|customer ?care|helpline|सहायता)/,
    ],
    requiresAny: [
      /refund|complaint|account|kyc|block|payment|upi|order|cancel|लेनदेन|खाता|शिकायत|भुगतान/,
    ],
  },

  // ------------------------------------------------------- delivery & shopping
  {
    id: "delivery_fee_request",
    category: "delivery",
    severity: "high",
    weight: 18,
    order: 60,
    title: {
      en: "A small fee is needed to release a parcel",
      hi: "पार्सल छुड़ाने के लिए छोटा शुल्क माँगा जा रहा है",
    },
    explanation: {
      en: "Couriers do not collect redelivery or customs charges through links sent by SMS. This scam harvests card details for a tiny-looking amount.",
      hi: "कूरियर सेवाएँ SMS में भेजे लिंक से दोबारा डिलीवरी या सीमा शुल्क नहीं लेतीं। इस ठगी में छोटी रकम के बहाने कार्ड की जानकारी ली जाती है।",
    },
    patterns: [
      /(?:parcel|package|courier|shipment|consignment|india post|speed post|registered post|fedex|dhl|blue ?dart|delhivery|ekart|पार्सल|कूरियर|डिलीवरी|शिपमेंट)/,
    ],
    requiresAny: [
      /(?:fee|charge|payment|pay|clearance|customs|redelivery|re-?delivery|held|stuck|pending|address|शुल्क|भुगतान|रोका|अटका|फँसा|पता)/,
    ],
    minMatches: 2,
  },
  {
    id: "fake_shopping_order",
    category: "delivery",
    severity: "low",
    weight: 8,
    order: 61,
    title: {
      en: "Unrecognised order, dispatch or sale message",
      hi: "अनजान ऑर्डर, डिस्पैच या सेल का संदेश",
    },
    explanation: {
      en: "If you did not order it, don't engage with the link. Open the shopping app you actually use and check your orders there.",
      hi: "अगर आपने ऑर्डर नहीं किया, तो लिंक पर न जाएँ। जिस शॉपिंग ऐप का आप उपयोग करते हैं उसे खोलकर वहाँ अपने ऑर्डर देखें।",
    },
    patterns: [
      /(?:your order|ऑर्डर)[^.!?\n]{0,40}(?:has been|is|will be)[^.!?\n]{0,25}(?:dispatched|shipped|delivered|cancelled|held|भेजा|रद्द)/,
      /(?:mega|biggest|flash|dhamaka)\s+(?:sale|offer|deal)/,
      /(?:claim|grab)[^.!?\n]{0,25}(?:your|the)[^.!?\n]{0,20}(?:voucher|coupon|discount|reward)/,
    ],
    requiresAny: [new RegExp(`(?:${LINKY.source}|${MONEY.source}|${PRIZE.source})`)],
  },

  // ------------------------------------------------------- investment & prize
  {
    id: "guaranteed_returns",
    category: "investment",
    severity: "high",
    weight: 24,
    order: 70,
    title: {
      en: "Guaranteed or risk-free high returns",
      hi: "गारंटीड या जोखिम-मुक्त ऊँचा मुनाफ़ा",
    },
    explanation: {
      en: "No investment can guarantee returns. In India, guaranteed-return claims are one of the fastest-growing fraud categories, often run through Telegram groups with fake profit screenshots.",
      hi: "कोई भी निवेश मुनाफ़े की गारंटी नहीं दे सकता। भारत में गारंटीड रिटर्न के दावे तेज़ी से बढ़ती ठगी श्रेणी हैं, जो अक्सर नकली मुनाफ़े के स्क्रीनशॉट दिखाने वाले Telegram ग्रुप से चलती हैं।",
    },
    patterns: [
      /(?:guaranteed|assured|fixed|sure|confirmed)[^.!?\n]{0,30}(?:return|profit|roi|income|gain|benefit|रिटर्न|मुनाफ़ा|लाभ)/,
      /(?:double|triple|2x|3x)[^.!?\n]{0,25}(?:your\s+)?(?:money|investment|capital|पैसा|निवेश)/,
      /(?:daily|monthly|weekly)[^.!?\n]{0,25}(?:profit|returns?|income|मुनाफ़ा|आय)[^.!?\n]{0,25}\d{1,3}\s?%/,
      /no\s+risk|zero\s+risk|risk[- ]free\s+(?:investment|returns?)/,
      /\d{1,3}\s?%[^.!?\n]{0,30}(?:guaranteed|per day|per month|daily|monthly|monthly returns)/,
      /(?:गारंटी|गारंटीड)[^.!?\n]{0,25}(?:रिटर्न|मुनाफ़ा|लाभ)/,
      /(?:पैसा|निवेश)[^.!?\n]{0,20}(?:दुगना|तिगुना|डबल)/,
    ],
  },
  {
    id: "trading_group_invitation",
    category: "investment",
    severity: "medium",
    weight: 15,
    order: 71,
    title: {
      en: "Invitation to a trading or 'sure-shot' tips group",
      hi: "ट्रेडिंग या 'स्योर-शॉट' टिप्स ग्रुप का निमंत्रण",
    },
    explanation: {
      en: "Unregulated tip groups in the name of a registered adviser or exchange are a common investment-fraud front. Check SEBI registration before trusting any adviser.",
      hi: "पंजीकृत सलाहकार या एक्सचेंज के नाम पर चलने वाले अपंजीकृत टिप ग्रुप आम निवेश-ठगी हैं। किसी सलाहकार पर भरोसा करने से पहले SEBI पंजीकरण जाँचें।",
    },
    patterns: [
      /(?:crypto|forex|trading|stock|share market|nifty|bank nifty|option|f&o|intraday|sure[- ]?shot)[^.!?\n]{0,45}(?:profit|return|invest|join|group|signal|guaranteed|double|मुनाफ़ा|निवेश|ग्रुप)/,
      /(?:telegram|whatsapp)[^.!?\n]{0,30}(?:group|channel|ग्रुप|चैनल)[^.!?\n]{0,30}(?:trading|tips|profit|invest|signal|ट्रेडिंग|टिप्स)/,
      /(?:sebi registered|portfolio management|advisory)[^.!?\n]{0,30}(?:profit|return|join|guaranteed)/,
    ],
  },
  {
    id: "prize_or_lottery",
    category: "prize",
    severity: "high",
    weight: 22,
    order: 72,
    title: {
      en: "You have 'won' a lottery, prize or lucky draw",
      hi: "आपने लॉटरी, इनाम या लकी ड्रॉ 'जीता' है",
    },
    explanation: {
      en: "You cannot win a lottery you never entered. These messages exist to move you to a payment or a bank-detail request.",
      hi: "जिस लॉटरी में आपने भाग नहीं लिया, उसे आप जीत नहीं सकते। ये संदेश आपको भुगतान या बैंक जानकारी माँगने तक ले जाने के लिए होते हैं।",
    },
    patterns: [
      /(?:won|winner|jackpot|lottery|bumper|scratch ?card|kbc|lucky (?:draw|customer|winner)|इनाम|लॉटरी|बंपर|विजेता|लकी ड्रॉ)/,
      /(?:congratulat|बधाई)/,
      /(?:prize|reward|gift|cash)\s+(?:worth|of|amount|इनाम|राशि)/,
      /(?:claim|collect)\s+(?:your|the)\s+(?:prize|reward|winning|gift|इनाम|पुरस्कार)/,
    ],
    minMatches: 2,
    requiresAny: [PRIZE],
  },
  {
    id: "fake_government_scheme",
    category: "prize",
    severity: "medium",
    weight: 14,
    order: 73,
    title: {
      en: "Government scheme or scholarship with a private link",
      hi: "सरकारी योजना या छात्रवृत्ति के साथ निजी लिंक",
    },
    explanation: {
      en: "Genuine scheme payouts are credited directly and are announced on official portals. A private link or fee for a benefit payment is a warning sign.",
      hi: "असली योजना की राशि सीधे खाते में आती है और आधिकारिक पोर्टल पर घोषित होती है। लाभ के लिए निजी लिंक या शुल्क माँगना चेतावनी संकेत है।",
    },
    patterns: [
      /(?:pm ?kisan|pmay|pmjay|mnrega|ayushman|scholarship|subsidy|yojana|benefit transfer|dbt|छात्रवृत्ति|सब्सिडी|योजना|अनुदान|लाभ)/,
    ],
    requiresAny: [
      new RegExp(
        `(?:${LINKY.source}|${MONEY.source}|${VERIFY.source}|${CREDENTIALS.source}|registration|रजिस्ट्रेशन)`,
      ),
    ],
    minMatches: 2,
  },

  // ---------------------------------------------------------- remote access
  {
    id: "remote_access_request",
    category: "remote_access",
    severity: "high",
    weight: 26,
    order: 80,
    title: {
      en: "You are asked to install remote-access or screen-sharing software",
      hi: "रिमोट एक्सेस या स्क्रीन शेयरिंग ऐप इंस्टॉल करने को कहा जा रहा है",
    },
    explanation: {
      en: "Screen sharing lets the other person watch you type passwords and OTPs, and may let them control your phone. Support staff never need it on an unsolicited call.",
      hi: "स्क्रीन शेयर करने पर सामने वाला आपके पासवर्ड और OTP देख सकता है और आपके फ़ोन को चला सकता है। बिना बुलाए आए कॉल में कोई असली सहायता कर्मी ऐसा नहीं माँगता।",
    },
    patterns: [
      /anydesk|teamviewer|quick ?support|rustdesk|airdroid|ultraviewer|supremo|screen ?connect|scrcpy/,
      /(?:screen ?shar\w*|remote (?:access|control|support|desktop)|screen mirroring|स्क्रीन शेयर|स्क्रीन साझा|रिमोट एक्सेस)/,
      /(?:access|control)[^.!?\n]{0,25}(?:your|आपके)[^.!?\n]{0,20}(?:phone|device|screen|computer|फ़ोन|डिवाइस|स्क्रीन)/,
    ],
  },
  {
    id: "unknown_app_or_apk_install",
    category: "malformed_content",
    severity: "high",
    weight: 25,
    order: 81,
    title: {
      en: "You are asked to install an APK or app from a link",
      hi: "लिंक से APK या ऐप इंस्टॉल करने को कहा जा रहा है",
    },
    explanation: {
      en: "Apps installed from links bypass app-store review and can read your messages, steal OTPs and control your banking apps. Install only from Google Play or the App Store.",
      hi: "लिंक से इंस्टॉल किए गए ऐप ऐप-स्टोर की जाँच से बच निकलते हैं और आपके संदेश पढ़ सकते हैं, OTP चुरा सकते हैं और बैंकिंग ऐप चला सकते हैं। ऐप केवल Google Play या App Store से इंस्टॉल करें।",
    },
    patterns: [
      /\.apk\b/,
      /(?:install|download|साइडलोड|इंस्टॉल|डाउनलोड)[^.!?\n]{0,35}(?:apk|from (?:this|the|below) link|unknown source|third[- ]party source|इस लिंक)/,
      /enable[^.!?\n]{0,30}(?:unknown sources|install from unknown|अज्ञात स्रोत)/,
      /(?:update|new version)[^.!?\n]{0,25}(?:download|install)[^.!?\n]{0,25}(?:link|from|डाउनलोड)/,
    ],
  },
  {
    id: "obfuscated_characters",
    category: "malformed_content",
    severity: "medium",
    weight: 14,
    order: 82,
    scanRaw: true,
    title: {
      en: "Hidden or lookalike characters in the text",
      hi: "टेक्स्ट में छिपे हुए या मिलते-जुलते अक्षर",
    },
    explanation: {
      en: "Invisible characters and lookalike letters are inserted to slip past spam filters and to make a fake address look like a real one. Legitimate senders have no reason to do this.",
      hi: "अदृश्य अक्षर और मिलते-जुलते अक्षर स्पैम फ़िल्टर से बचने और नकली पते को असली जैसा दिखाने के लिए डाले जाते हैं। असली भेजने वाले का ऐसा करने का कोई कारण नहीं होता।",
    },
    patterns: [
      /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF\u00AD]/,
      /[\u0400-\u04FF]/,
      /[\uFF01-\uFF5E]/,
    ],
    minMatches: 1,
  },

  // --------------------------------------------------------- links (in text)
  {
    id: "shortened_link",
    category: "link",
    severity: "medium",
    weight: 14,
    order: 90,
    title: {
      en: "A shortened link hides its real destination",
      hi: "छोटा किया गया लिंक असली पता छिपाता है",
    },
    explanation: {
      en: "Shortened links hide where you are really going. If a message pushes you to a shortener, find the organisation's own app or website instead.",
      hi: "छोटे लिंक छिपा देते हैं कि आप वास्तव में कहाँ जा रहे हैं। अगर संदेश आपको ऐसे लिंक पर भेज रहा है, तो संस्था का असली ऐप या वेबसाइट खुद खोलें।",
    },
    patterns: [
      /(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly|shorturl\.at|tiny\.cc|rb\.gy|shorturl|adf\.ly|bit\.do|t\.ly|urlz\.fr|surl\.li|bl\.ink|clck\.ru|v\.gd|shorte\.st|soo\.gd|tiny\.one)/,
    ],
  },
  {
    id: "risky_domain_extension",
    category: "link",
    severity: "medium",
    weight: 12,
    order: 91,
    title: {
      en: "Link uses an extension commonly used by fraud sites",
      hi: "लिंक ऐसी एक्सटेंशन इस्तेमाल करता है जो ठगी वाली साइटें आमतौर पर लेती हैं",
    },
    explanation: {
      en: "Cheap or free domain extensions are heavily used for short-lived fraud sites. Banks and government portals use their own country domain.",
      hi: "सस्ती या मुफ़्त डोमेन एक्सटेंशन थोड़े समय चलने वाली ठगी वाली साइटों में बहुत इस्तेमाल होती हैं। बैंक और सरकारी पोर्टल अपना देश-डोमेन इस्तेमाल करते हैं।",
    },
    patterns: [
      /https?:\/\/[^\s/]*\.(?:xyz|top|online|site|shop|club|buzz|icu|vip|win|bid|loan|work|click|link|live|cf|gq|ml|tk|zip|mov|country|stream|download|racing|review|kim|men|date|party|gdn|quest|rest|monster|sbs|cyou)(?:\/|\b)/,
    ],
  },
  {
    id: "ip_address_host_link",
    category: "link",
    severity: "medium",
    weight: 16,
    order: 92,
    title: {
      en: "Link points to a raw IP address",
      hi: "लिंक सीधे IP पते की ओर इशारा करता है",
    },
    explanation: {
      en: "Real services use domain names. A link made only of numbers is a strong sign of a temporary or throwaway server.",
      hi: "असली सेवाएँ डोमेन नाम इस्तेमाल करती हैं। केवल संख्याओं वाला लिंक अस्थायी या फेंकने वाले सर्वर का मज़बूत संकेत है।",
    },
    patterns: [
      /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?/,
      /https?:\/\/[^\s/]*:\d{2,5}\//,
    ],
  },
  {
    id: "insecure_or_obfuscated_link",
    category: "link",
    severity: "medium",
    weight: 14,
    order: 93,
    title: {
      en: "Link is obfuscated or not secured",
      hi: "लिंक छिपाया गया है या सुरक्षित नहीं है",
    },
    explanation: {
      en: "Links containing an '@' sign, unreadable percent-encoding, or many unnecessary subdomains are used to disguise the real destination.",
      hi: "'@' चिह्न, पढ़ने में कठिन प्रतिशत-एन्कोडिंग, या बहुत से अनावश्यक सबडोमेन असली पता छिपाने के लिए डाले जाते हैं।",
    },
    patterns: [
      /https?:\/\/[^\s/]*@/,
      /https?:\/\/(?:[a-z0-9-]+\.){4,}/,
      /%[0-9a-f]{2}%[0-9a-f]{2}/,
      /https?:\/\/[^\s/]*(?:account|login|verify|secure|update|kyc|bank)[^\s/]*\.[a-z]{2,}/,
    ],
    requiresAny: [new RegExp(`(?:${LINKY.source}|${CREDENTIALS.source})`)],
    minMatches: 2,
  },
  {
    id: "unexpected_link",
    category: "link",
    severity: "low",
    weight: 10,
    order: 94,
    title: {
      en: "An unexpected link is included",
      hi: "एक अप्रत्याशित लिंक दिया गया है",
    },
    explanation: {
      en: "A link you did not ask for, combined with a request for money or information, is the single most common shape of an Indian phishing message. Type the official address yourself instead.",
      hi: "जिस लिंक की आपको उम्मीद नहीं थी, और साथ में पैसे या जानकारी की माँग — भारत में फ़िशिंग संदेश का सबसे आम रूप यही है। बजाय इसके, आधिकारिक पता खुद टाइप करें।",
    },
    patterns: [
      /https?:\/\/[^\s]+/,
      /\bwww\.[a-z0-9-]+\.[a-z]{2,}/,
    ],
    requiresAny: [SUSPICIOUS_CONTEXT],
  },
  {
    id: "callback_to_unknown_number",
    category: "authority_impersonation",
    severity: "low",
    weight: 8,
    order: 95,
    title: {
      en: "You are told to call an unfamiliar number",
      hi: "अनजान नंबर पर कॉल करने को कहा जा रहा है",
    },
    explanation: {
      en: "Numbers supplied inside a suspicious message lead to the fraudster, not the company. Get the number from an official source you type in yourself.",
      hi: "संदिग्ध संदेश में दिया नंबर ठग तक पहुँचाता है, कंपनी तक नहीं। नंबर किसी आधिकारिक स्रोत से लें जिसे आप खुद टाइप करें।",
    },
    patterns: [
      /(?:call|dial|contact|कॉल|संपर्क)[^.!?\n]{0,30}(?:\+?91[-\s]?\d{5}[-\s]?\d{5}|\b\d{10}\b|\b1800[-\s]?\d{3}[-\s]?\d{3,4}\b)/,
      /\b(?:wa\.me|api\.whatsapp\.com|t\.me|telegram\.me)\/[^\s]+/,
    ],
    requiresAny: [SUSPICIOUS_CONTEXT],
  },

  // ---------------------------------------------------------------- kyc/kyc
  {
    id: "kyc_or_verification_update",
    category: "verification",
    severity: "medium",
    weight: 16,
    order: 100,
    title: {
      en: "KYC or account verification is demanded",
      hi: "KYC या खाता सत्यापन की माँग",
    },
    explanation: {
      en: "Banks ask for KYC at a branch or through their own app — never through a link in an SMS. Fake KYC expiry is the most-reported banking fraud message in India.",
      hi: "बैंक KYC शाखा में या अपने ऐप से माँगते हैं — SMS के लिंक से कभी नहीं। नकली KYC समाप्ति भारत में सबसे ज़्यादा रिपोर्ट किया जाने वाला बैंकिंग ठगी संदेश है।",
    },
    patterns: [
      /\bkyc\b|केवाईसी|know your customer|re-?kyc|video kyc|केवाईसी अपडेट/,
      /(?:aadhaar|आधार)[^.!?\n]{0,25}(?:link|update|seed|verify|जोड़ें|अपडेट|सत्यापित)/,
      /(?:pan|पैन)[^.!?\n]{0,25}(?:link|update|verify|अपडेट|सत्यापित)/,
      /(?:account|खाता)[^.!?\n]{0,25}(?:verification|re-?verification|सत्यापन)/,
    ],
    requiresAny: [
      /update|verify|expir|suspend|block|complete|link|pending|immediate|अपडेट|सत्यापित|समाप्त|बंद|पूरा|लंबित|तुरंत/,
    ],
  },
  {
    id: "loan_offer_with_fee",
    category: "advance_fee",
    severity: "medium",
    weight: 16,
    order: 101,
    title: {
      en: "Instant loan offer with an upfront charge",
      hi: "तुरंत लोन के साथ पहले शुल्क की माँग",
    },
    explanation: {
      en: "Unregulated instant-loan apps demand a fee before disbursal, then harvest contacts and photos. Only borrow from RBI-regulated entities.",
      hi: "अपंजीकृत इंस्टेंट-लोन ऐप पैसे देने से पहले शुल्क माँगते हैं, फिर संपर्क और फ़ोटो चुरा लेते हैं। केवल RBI-पंजीकृत संस्थाओं से कर्ज़ लें।",
    },
    patterns: [
      /(?:pre-?approved|instant|guaranteed|no documents?|no cibil|without cibil)[^.!?\n]{0,30}loan|loan[^.!?\n]{0,30}(?:in \d+ minutes|without documents|no cibil|instant)/,
      /लोन|ऋण|कर्ज़/,
      /(?:processing|advance|file|documentation)\s+(?:fee|charge)[^.!?\n]{0,30}(?:loan|कर्ज़|लोन)/,
    ],
    requiresAny: [
      /loan|लोन|ऋण|कर्ज़|fee|charge|approved|sanction|disburse|शुल्क|स्वीकृत|भुगतान/,
    ],
    minMatches: 2,
  },

  // ----------------------------------------------------- weak tone heuristics
  {
    id: "generic_salutation",
    category: "verification",
    severity: "low",
    weight: 6,
    order: 110,
    title: {
      en: "Generic greeting instead of your name",
      hi: "आपके नाम की जगह सामान्य संबोधन",
    },
    explanation: {
      en: "A weak signal on its own — most marketing uses it. It only gains meaning alongside a request for information or money.",
      hi: "यह अकेले में कमज़ोर संकेत है — ज़्यादातर विज्ञापन ऐसा लिखते हैं। यह तभी मायने रखता है जब साथ में जानकारी या पैसे की माँग हो।",
    },
    patterns: [
      /dear (?:customer|user|sir\/madam|valued (?:customer|member)|account holder|candidate)/,
      /प्रिय (?:ग्राहक|उपयोगकर्ता)|आदरणीय (?:ग्राहक|सदस्य)/,
      /dear (?:customer|user),?/,
    ],
    requiresAny: [SUSPICIOUS_CONTEXT],
  },
  {
    id: "excessive_punctuation_or_caps",
    category: "urgency",
    severity: "low",
    weight: 6,
    order: 111,
    title: {
      en: "Shouting style: capital letters, symbols or repeated icons",
      hi: "चिल्लाते अंदाज़ में लिखा टेक्स्ट",
    },
    explanation: {
      en: "Excessive capitals, exclamation marks and emoji are used to create excitement or alarm. Real transactional notices stay plain.",
      hi: "बहुत सारे बड़े अक्षर, विस्मयादिबोधक चिह्न और इमोजी उत्साह या डर पैदा करने के लिए इस्तेमाल होते हैं। असली लेन-देन सूचनाएँ सादी होती हैं।",
    },
    patterns: [/\b[A-Z]{12,}\b/, /!{3,}/, /(?:₹|\$)\s?\d[\d,]{2,}/, /[\u{1F300}-\u{1FAFF}]/u],
    minMatches: 2,
  },
];

/** Rules indexed by id. */
export const RULES_BY_ID: Record<string, Rule> = Object.fromEntries(
  RULES.map((rule) => [rule.id, rule]),
);

/**
 * Softening phrases. When a message contains one of these AND nothing more
 * serious than low-severity rules matched, the indicative score is dampened.
 * Real bank and utility messages include opt-out and anti-fraud language.
 */
export const LEGITIMATE_CONTEXT_MARKERS: RegExp[] = [
  /unsubscribe|opt[- ]out|to stop receiving|stop messaging|अनसब्सक्राइब/,
  /do not share (?:your )?(?:otp|pin|password)/,
  /(?:we|bank|company) (?:will )?never (?:ask|call|request)/,
  /grievance|nodal officer|registered office|sebi registration|corporate identity/,
  /this is an automated (?:message|alert)|do not reply to this/,
  /terms (?:and|&) conditions|privacy policy/,
  /customer care|toll[- ]?free|helpline|ग्राहक सेवा/,
  /thank you for (?:your )?(?:business|order|payment)/,
  /(?:your )?(?:account|a\/?c) (?:is )?(?:debited|credited)\b/,
  /यह एक स्वचालित संदेश|कृपया उत्तर न दें/,
];
