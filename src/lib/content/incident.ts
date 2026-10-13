import type { IncidentSituation } from "@/lib/types-app";

/**
 * Incident-response playbooks.
 *
 * Every playbook is written to stay within what TrustTap AI can honestly claim:
 * it tells the user what THEY should do and where official help is. The app
 * never states that it contacted a bank, froze money, filed a complaint or
 * completed a government report — because it cannot do any of those things.
 *
 * Wording rules followed throughout:
 *  - "contact your bank" — never "we have alerted your bank"
 *  - "report it at" — never "we have filed a report"
 *  - never guarantee that money will be recovered
 */

export type Playbook = {
  id: IncidentSituation;
  label: { en: string; hi: string };
  description: { en: string; hi: string };
  /** Ordered so the single most time-critical action is always first. */
  immediate: { en: string[]; hi: string[] };
  /** Follow-up within the first day. */
  followUp: { en: string[]; hi: string[] };
  /** Whether the financial-fraud helpline applies. */
  showHelpline: boolean;
  /** Whether the telecom cyber-safety portal applies. */
  showSanchar: boolean;
  /** Whether to emphasise that the account itself is compromised. */
  accountCompromised: boolean;
  /** Severity hint used purely for presentation urgency. */
  urgency: "critical" | "high" | "moderate";
};

export const PLAYBOOKS: Playbook[] = [
  {
    id: "approved_payment",
    label: {
      en: "I approved a payment or sent money",
      hi: "मैंने भुगतान किया या पैसे भेजे",
    },
    description: {
      en: "Money left your account via UPI, card, transfer or wallet.",
      hi: "UPI, कार्ड, ट्रांसफर या वॉलेट से पैसे चले गए।",
    },
    urgency: "critical",
    showHelpline: true,
    showSanchar: false,
    accountCompromised: false,
    immediate: {
      en: [
        "Call the national cybercrime helpline 1930 as soon as possible. Reporting within the first hours gives the best chance of a transaction being stopped.",
        "In your UPI or payment app, check for any pending or collect request and decline it.",
        "Call your bank or payment provider on the number printed on your card, passbook or official app — not a number from the suspicious message.",
        "Ask them to freeze the transaction, block the card, and disable UPI access while you investigate.",
        "Note the exact amount, the transaction reference/UTR number, and the time it happened.",
      ],
      hi: [
        "जल्द से जल्द राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 पर कॉल करें। पहले कुछ घंटों में रिपोर्ट करने पर लेन-देन रोकने की सबसे अच्छी संभावना होती है।",
        "अपने UPI या भुगतान ऐप में कोई भी पेंडिंग या collect अनुरोध देखें और अस्वीकार करें।",
        "अपने बैंक या भुगतान सेवा को उसी नंबर पर कॉल करें जो कार्ड, पासबुक या आधिकारिक ऐप पर है — संदिग्ध संदेश के नंबर पर नहीं।",
        "उनसे कहें कि लेन-देन फ्रीज़ करें, कार्ड ब्लॉक करें, और जाँच के दौरान UPI पहुँच बंद कर दें।",
        "राशि, ट्रांजैक्शन रेफ़रेंस/UTR नंबर और समय नोट कर लें।",
      ],
    },
    followUp: {
      en: [
        "File an official complaint at the National Cyber Crime Reporting Portal.",
        "Keep the chat, the sender's number and every screenshot — they are evidence.",
        "Change your banking passwords and enable two-factor authentication.",
      ],
      hi: [
        "राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल पर आधिकारिक शिकायत दर्ज करें।",
        "चैट, भेजने वाले का नंबर और सभी स्क्रीनशॉट संभालकर रखें — ये सबूत हैं।",
        "अपने बैंकिंग पासवर्ड बदलें और दो-चरणीय प्रमाणीकरण चालू करें।",
      ],
    },
  },
  {
    id: "shared_otp",
    label: {
      en: "I shared an OTP or password",
      hi: "मैंने OTP या पासवर्ड बता दिया",
    },
    description: {
      en: "You gave someone a one-time code or your login details.",
      hi: "आपने किसी को वन-टाइम कोड या लॉगिन जानकारी दी।",
    },
    urgency: "critical",
    showHelpline: true,
    showSanchar: false,
    accountCompromised: true,
    immediate: {
      en: [
        "Treat the account as compromised right now. Assume money can move from it.",
        "Change the password immediately, from a device you trust — not from a link anyone sent you.",
        "Call your bank or payment provider on their official number and tell them an OTP was shared. Ask them to freeze the account or block UPI and card payments.",
        "Decline any pending request in your payment app and check recent transactions for anything you did not do.",
        "If the code was for something else (email, social media, Aadhaar), change that password too and sign out all other sessions.",
      ],
      hi: [
        "उस खाते को अभी असुरक्षित मानें। मान लें कि उससे पैसे निकल सकते हैं।",
        "तुरंत पासवर्ड बदलें, उसी डिवाइस से जिस पर आपको भरोसा है — किसी के भेजे लिंक से नहीं।",
        "अपने बैंक या भुगतान सेवा को आधिकारिक नंबर पर कॉल करें और बताएँ कि OTP साझा हो गया है। खाता फ्रीज़ करने या UPI व कार्ड भुगतान बंद करने को कहें।",
        "भुगतान ऐप में कोई भी पेंडिंग अनुरोध अस्वीकार करें, और हाल के लेन-देन जाँचें कि कोई आपका नहीं है।",
        "अगर कोड किसी और चीज़ का था (ईमेल, सोशल मीडिया, आधार), तो उसका पासवर्ड भी बदलें और दूसरे सभी सेशन से साइन आउट करें।",
      ],
    },
    followUp: {
      en: [
        "Turn on two-factor authentication everywhere it is offered.",
        "Check for new payees, mandates or linked devices you did not add.",
        "Report the call or message to the telecom cyber-safety portal.",
      ],
      hi: [
        "जहाँ भी उपलब्ध हो, दो-चरणीय प्रमाणीकरण चालू करें।",
        "नए पेयी, मैंडेट या जुड़े डिवाइस जाँचें जो आपने नहीं जोड़े।",
        "उस कॉल या संदेश की शिकायत दूरसंचार साइबर-सुरक्षा पोर्टल पर करें।",
      ],
    },
  },
  {
    id: "shared_screen",
    label: {
      en: "I shared screen or remote access",
      hi: "मैंने स्क्रीन या रिमोट एक्सेस दिया",
    },
    description: {
      en: "You let someone view or control your device.",
      hi: "किसी को आपका डिवाइस देखने या चलाने दिया।",
    },
    urgency: "critical",
    showHelpline: true,
    showSanchar: false,
    accountCompromised: true,
    immediate: {
      en: [
        "End the remote session now and uninstall the remote-access app (AnyDesk, TeamViewer, QuickSupport and similar).",
        "Disconnect from the internet (turn off Wi-Fi and mobile data) so nothing further can be read or transferred while you change passwords.",
        "From a different, trusted device, change your banking, email and UPI passwords.",
        "Call your bank on their official number and ask them to freeze the account while you check for transfers.",
        "Check your transactions and any newly added payees, mandates or beneficiaries.",
      ],
      hi: [
        "रिमोट सेशन अभी समाप्त करें और रिमोट एक्सेस ऐप (AnyDesk, TeamViewer, QuickSupport आदि) हटा दें।",
        "इंटरनेट बंद करें (Wi-Fi और मोबाइल डेटा बंद करें) ताकि पासवर्ड बदलने तक कुछ और पढ़ा या भेजा न जा सके।",
        "किसी दूसरे भरोसेमंद डिवाइस से अपने बैंकिंग, ईमेल और UPI पासवर्ड बदलें।",
        "अपने बैंक को आधिकारिक नंबर पर कॉल करें और ट्रांसफर जाँचने तक खाता फ्रीज़ करने को कहें।",
        "अपने लेन-देन और नए जोड़े गए पेयी, मैंडेट या लाभार्थी जाँचें।",
      ],
    },
    followUp: {
      en: [
        "Run a security scan and check which apps have accessibility or screen-recording permission.",
        "Sign out of all other sessions on your important accounts.",
        "Report the incident to the National Cyber Crime Reporting Portal.",
      ],
      hi: [
        "सुरक्षा स्कैन चलाएँ और देखें कि किन ऐप को एक्सेसिबिलिटी या स्क्रीन-रिकॉर्डिंग की अनुमति है।",
        "अपने ज़रूरी खातों के अन्य सभी सेशन से साइन आउट करें।",
        "घटना की शिकायत राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल पर करें।",
      ],
    },
  },
  {
    id: "installed_app",
    label: {
      en: "I installed an unfamiliar application",
      hi: "मैंने अनजान ऐप इंस्टॉल किया",
    },
    description: {
      en: "You installed an APK or app you did not intend to install.",
      hi: "आपने कोई APK या ऐप इंस्टॉल कर लिया जो नहीं चाहते थे।",
    },
    urgency: "high",
    showHelpline: false,
    showSanchar: false,
    accountCompromised: true,
    immediate: {
      en: [
        "Put the phone in airplane mode, then uninstall the app — this stops it reading SMS and notifications while you act.",
        "Check which permissions it was granted, especially SMS, accessibility, notifications and device admin. Revoke any device-administrator access first, otherwise uninstalling may be blocked.",
        "From another device, change your banking and email passwords.",
        "Review your bank statements and UPI history for anything you did not do.",
        "If an OTP was read from your phone, treat your accounts as compromised and call your bank.",
      ],
      hi: [
        "फ़ोन को airplane मोड में डालें, फिर ऐप अनइंस्टॉल करें — इससे कार्रवाई के दौरान वह SMS और नोटिफ़िकेशन पढ़ना बंद कर देगा।",
        "देखें कि उसे कौन-सी अनुमतियाँ मिली थीं — खासकर SMS, एक्सेसिबिलिटी, नोटिफ़िकेशन और device admin. पहले device-admin पहुँच हटाएँ, वरना अनइंस्टॉल रुक सकता है।",
        "किसी दूसरे डिवाइस से अपने बैंकिंग और ईमेल पासवर्ड बदलें।",
        "अपने बैंक स्टेटमेंट और UPI इतिहास में देखें कि कोई लेन-देन आपका नहीं है।",
        "अगर फ़ोन से OTP पढ़ा गया था, तो खातों को असुरक्षित मानें और बैंक को कॉल करें।",
      ],
    },
    followUp: {
      en: [
        "Install apps only from Google Play or the App Store from now on.",
        "Turn off 'install from unknown sources' in your phone settings.",
        "Report the app and the message that promoted it.",
      ],
      hi: [
        "अब से ऐप केवल Google Play या App Store से इंस्टॉल करें।",
        "फ़ोन सेटिंग्स में 'अज्ञात स्रोत से इंस्टॉल' बंद कर दें।",
        "उस ऐप और उसे बढ़ावा देने वाले संदेश की शिकायत करें।",
      ],
    },
  },
  {
    id: "shared_personal_info",
    label: {
      en: "I shared personal information",
      hi: "मैंने निजी जानकारी साझा की",
    },
    description: {
      en: "Name, address, ID number, photos or documents.",
      hi: "नाम, पता, पहचान संख्या, फ़ोटो या दस्तावेज़।",
    },
    urgency: "high",
    showHelpline: false,
    showSanchar: false,
    accountCompromised: false,
    immediate: {
      en: [
        "Work out exactly what was shared — name, address, date of birth, Aadhaar, PAN, a photo of a document, or a selfie.",
        "If your Aadhaar number was shared, lock your biometrics in the UIDAI app or portal and review your authentication history.",
        "If a document photo was shared, watch for messages that quote real details about you — those are the ones to distrust first.",
        "Never share an OTP that arrives afterwards, even if the caller already knows your name. That combination is how identity theft turns into money loss.",
      ],
      hi: [
        "ठीक-ठीक देखें कि क्या साझा हुआ — नाम, पता, जन्म तिथि, आधार, पैन, दस्तावेज़ की फ़ोटो या सेल्फ़ी।",
        "अगर आधार नंबर साझा हुआ है, तो UIDAI ऐप या पोर्टल से बायोमेट्रिक लॉक करें और प्रमाणीकरण इतिहास देखें।",
        "अगर दस्तावेज़ की फ़ोटो साझा हुई है, तो ऐसे संदेशों से सावधान रहें जिनमें आपकी असली जानकारी हो — इन्हीं पर सबसे पहले संदेह करें।",
        "उसके बाद आने वाला OTP कभी साझा न करें, चाहे कॉल करने वाला आपका नाम जानता हो। यही तरीका पहचान चोरी को पैसे की चोरी में बदलता है।",
      ],
    },
    followUp: {
      en: [
        "Set a strong, unique password on your email — it is the reset route for everything else.",
        "Tell your bank to add extra verification if large transfers are requested.",
        "Report the incident if the details are used to impersonate you.",
      ],
      hi: [
        "अपने ईमेल पर मज़बूत और अलग पासवर्ड लगाएँ — बाकी सब कुछ उसी से रीसेट होता है।",
        "बैंक से कहें कि बड़े ट्रांसफर के लिए अतिरिक्त पुष्टि जोड़ दें।",
        "अगर इन जानकारियों का इस्तेमाल आपकी नकली पहचान बनाने में हो, तो शिकायत दर्ज करें।",
      ],
    },
  },
  {
    id: "clicked_link",
    label: {
      en: "I clicked a suspicious link",
      hi: "मैंने संदिग्ध लिंक पर क्लिक किया",
    },
    description: {
      en: "You opened a link but have not entered anything yet.",
      hi: "लिंक खुला, पर अभी कुछ भरा नहीं।",
    },
    urgency: "moderate",
    showHelpline: false,
    showSanchar: true,
    accountCompromised: false,
    immediate: {
      en: [
        "Close the page and do not enter anything on it — not even a phone number or email to 'verify'.",
        "If you typed a password or PIN anywhere on that page, change it now from a trusted device and treat the account as compromised.",
        "Check your downloads folder for anything the site may have pushed, and delete it.",
        "Run a malware scan if the page prompted you to install something.",
        "Watch for follow-up calls or messages that quote details from that page — that is a sign your visit was recorded.",
      ],
      hi: [
        "पेज बंद करें और उस पर कुछ न भरें — 'सत्यापन' के लिए फ़ोन नंबर या ईमेल भी नहीं।",
        "अगर उस पेज पर कहीं पासवर्ड या पिन डाला था, तो भरोसेमंद डिवाइस से अभी बदलें और उस खाते को असुरक्षित मानें।",
        "अपने डाउनलोड फ़ोल्डर में देखें कि साइट ने कुछ भेजा तो नहीं, और उसे हटा दें।",
        "अगर पेज ने कुछ इंस्टॉल करने को कहा था, तो मैलवेयर स्कैन चलाएँ।",
        "आगे आने वाली कॉल या संदेशों पर ध्यान दें जिनमें उस पेज की जानकारी हो — यह संकेत है कि आपकी विज़िट दर्ज हुई।",
      ],
    },
    followUp: {
      en: [
        "Report the link and the message that carried it.",
        "Only use links you were already expecting, or type the official address yourself.",
      ],
      hi: [
        "उस लिंक और उसे भेजने वाले संदेश की शिकायत करें।",
        "केवल उन्हीं लिंक का उपयोग करें जिनकी आपको पहले से उम्मीद थी, या आधिकारिक पता खुद टाइप करें।",
      ],
    },
  },
  {
    id: "threat_call",
    label: {
      en: "I got a threatening or impersonation call",
      hi: "मुझे धमकी वाली या नकली पहचान की कॉल आई",
    },
    description: {
      en: "Someone posed as police, a bank, or a government officer.",
      hi: "किसी ने पुलिस, बैंक या सरकारी अधिकारी बनकर बात की।",
    },
    urgency: "high",
    showHelpline: false,
    showSanchar: true,
    accountCompromised: false,
    immediate: {
      en: [
        "Hang up. Indian police, courts, customs, TRAI and banks do not conduct cases or demand payment over a phone or video call.",
        "Do not pay anything to avoid an 'arrest', 'penalty' or 'case'. That demand is always the fraud.",
        "Do not share your screen, install anything, or read out any code.",
        "Note the number, the time and what they claimed, while you remember it.",
        "Report the number to the telecom cyber-safety portal so it can be investigated.",
      ],
      hi: [
        "कॉल काट दें। भारतीय पुलिस, अदालत, सीमा शुल्क, TRAI और बैंक फ़ोन या वीडियो कॉल पर मामला नहीं चलाते और पैसे नहीं माँगते।",
        "'गिरफ्तारी', 'जुर्माना' या 'केस' से बचने के लिए कुछ भी भुगतान न करें। यह माँग हमेशा ठगी होती है।",
        "स्क्रीन साझा न करें, कुछ इंस्टॉल न करें, और कोई कोड न बोलें।",
        "याद रहते हुए नंबर, समय और उनके दावे नोट कर लें।",
        "नंबर की शिकायत दूरसंचार साइबर-सुरक्षा पोर्टल पर करें ताकि जाँच हो सके।",
      ],
    },
    followUp: {
      en: [
        "Warn family members, especially older relatives, that this call is circulating.",
        "If you already paid, treat it as financial fraud and call the 1930 helpline.",
      ],
      hi: [
        "परिवार के सदस्यों, खासकर बड़े-बुज़ुर्गों को बताएँ कि ऐसी कॉल चल रही है।",
        "अगर भुगतान कर दिया है, तो इसे वित्तीय ठगी मानें और 1930 हेल्पलाइन पर कॉल करें।",
      ],
    },
  },
  {
    id: "something_else",
    label: {
      en: "Something else happened",
      hi: "कुछ और हुआ",
    },
    description: {
      en: "A different kind of suspicious online contact.",
      hi: "किसी और तरह का संदिग्ध ऑनलाइन संपर्क।",
    },
    urgency: "moderate",
    showHelpline: true,
    showSanchar: true,
    accountCompromised: false,
    immediate: {
      en: [
        "Stop responding, and do not send money or codes to anyone while you work out what happened.",
        "Write down what was asked for, what you shared, and when — before your memory of it changes.",
        "If any money moved, call the 1930 helpline immediately and then your bank.",
        "If no money moved but the contact was suspicious, report the message or number.",
      ],
      hi: [
        "जवाब देना बंद करें, और यह समझने तक किसी को पैसे या कोड न भेजें।",
        "क्या माँगा गया, क्या साझा किया और कब — लिख लें, इससे पहले कि याददाश्त धुँधली हो।",
        "अगर पैसे चले गए हैं, तो तुरंत 1930 हेल्पलाइन पर कॉल करें और फिर अपने बैंक से संपर्क करें।",
        "अगर पैसे नहीं गए पर संपर्क संदिग्ध था, तो उस संदेश या नंबर की शिकायत करें।",
      ],
    },
    followUp: {
      en: [
        "Check the Safety Center for the official route that matches your case.",
        "Save the evidence: screenshots, numbers, times and reference IDs.",
      ],
      hi: [
        "अपनी स्थिति से मेल खाता आधिकारिक रास्ता सुरक्षा केंद्र में देखें।",
        "सबूत सुरक्षित रखें: स्क्रीनशॉट, नंबर, समय और संदर्भ आईडी।",
      ],
    },
  },
];

export const PLAYBOOKS_BY_ID: Record<string, Playbook> = Object.fromEntries(
  PLAYBOOKS.map((playbook) => [playbook.id, playbook]),
);

export function getPlaybook(id: string): Playbook | null {
  return PLAYBOOKS_BY_ID[id] ?? null;
}
