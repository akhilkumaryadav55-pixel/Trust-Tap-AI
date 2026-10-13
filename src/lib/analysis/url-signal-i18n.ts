import type { Bi } from "./rules/types";

/**
 * Bilingual text for URL structural signals.
 *
 * `url.ts` stays free of presentation concerns and emits stable signal ids;
 * this map turns those ids into user-facing copy in the active language. Any
 * id missing here falls back to the English text produced by `url.ts`, so a new
 * signal can never render as an empty string.
 */
export const URL_SIGNAL_TEXT: Record<string, { title: Bi; explanation: Bi }> = {
  ip_literal: {
    title: {
      en: "The address is a raw IP number, not a domain name",
      hi: "पता सीधे IP नंबर है, डोमेन नाम नहीं",
    },
    explanation: {
      en: "Real banks and companies use named domains. A bare IP address usually points to a temporary server set up for an attack.",
      hi: "असली बैंक और कंपनियाँ नाम वाले डोमेन इस्तेमाल करती हैं। केवल IP पता आमतौर पर हमले के लिए बनाए गए अस्थायी सर्वर की ओर इशारा करता है।",
    },
  },
  link_shortener: {
    title: {
      en: "The link is shortened, hiding its real destination",
      hi: "लिंक छोटा किया गया है, असली पता छिपा है",
    },
    explanation: {
      en: "A shortened link shows you one address while sending you to another. You cannot tell where you will land until you arrive.",
      hi: "छोटा किया गया लिंक एक पता दिखाता है और आपको दूसरी जगह भेजता है। पहुँचने तक पता नहीं चलता कि आप कहाँ जाएँगे।",
    },
  },
  userinfo_disguise: {
    title: {
      en: "An “@” sign is used to disguise the real site",
      hi: "असली साइट छिपाने के लिए “@” चिह्न का इस्तेमाल",
    },
    explanation: {
      en: "Browsers ignore everything before “@”, so the visible part can look like a well-known brand while the real destination is a completely different site.",
      hi: "ब्राउज़र “@” से पहले का हिस्सा नज़रअंदाज़ कर देते हैं, इसलिए दिखने वाला हिस्सा किसी बड़े ब्रांड जैसा लग सकता है जबकि असली पता बिलकुल अलग साइट होती है।",
    },
  },
  excessive_subdomains: {
    title: {
      en: "Unusually many subdomains",
      hi: "असामान्य रूप से कई सबडोमेन",
    },
    explanation: {
      en: "Stacking subdomains pushes the real domain to the end of a long address, where it is easy to miss.",
      hi: "कई सबडोमेन जोड़कर असली डोमेन को लंबे पते के अंत में धकेल दिया जाता है, जहाँ उसे नज़रअंदाज़ करना आसान होता है।",
    },
  },
  punycode_hostname: {
    title: {
      en: "The domain uses an encoded international script",
      hi: "डोमेन एन्कोडेड अंतरराष्ट्रीय लिपि में है",
    },
    explanation: {
      en: "Punycode (xn--) is normal for non-Latin scripts, but it is also how visually identical lookalike domains are created. Read this address character by character.",
      hi: "गैर-लैटिन लिपियों के लिए punycode (xn--) सामान्य है, पर दिखने में एक जैसे नकली डोमेन भी इसी से बनाए जाते हैं। इस पते को एक-एक अक्षर पढ़ें।",
    },
  },
  risky_tld: {
    title: {
      en: "The extension is frequently used by short-lived fraud sites",
      hi: "यह एक्सटेंशन थोड़े समय चलने वाली ठगी वाली साइटों में आम है",
    },
    explanation: {
      en: "This extension is cheap or free to register, which makes it popular for throwaway phishing sites. It is not proof of fraud by itself.",
      hi: "यह एक्सटेंशन सस्ता या मुफ़्त होता है, इसलिए फेंकने वाली फ़िशिंग साइटों में लोकप्रिय है। यह अपने आप में ठगी का प्रमाण नहीं है।",
    },
  },
  no_https: {
    title: {
      en: "The link is not secured with HTTPS",
      hi: "लिंक HTTPS से सुरक्षित नहीं है",
    },
    explanation: {
      en: "Anything sent over plain http:// travels unencrypted. No bank, payment app or government portal serves a login page over http.",
      hi: "http:// पर भेजी गई जानकारी बिना एन्क्रिप्शन जाती है। कोई बैंक, भुगतान ऐप या सरकारी पोर्टल http पर लॉगिन पेज नहीं चलाता।",
    },
  },
  non_standard_port: {
    title: {
      en: "The link uses an unusual network port",
      hi: "लिंक असामान्य नेटवर्क पोर्ट इस्तेमाल करता है",
    },
    explanation: {
      en: "Non-standard ports are common on hastily configured or temporary servers, which is typical of short-lived fraud sites.",
      hi: "जल्दबाज़ी में बनाए या अस्थायी सर्वर पर असामान्य पोर्ट आम होते हैं, जो थोड़े समय चलने वाली ठगी साइटों की पहचान है।",
    },
  },
  numeric_brand_domain: {
    title: {
      en: "The domain name contains a long number",
      hi: "डोमेन नाम में लंबी संख्या है",
    },
    explanation: {
      en: "Adding digits to a brand name is a standard way to register a lookalike domain when the exact name is taken.",
      hi: "असली नाम उपलब्ध न होने पर ब्रांड नाम में अंक जोड़कर मिलता-जुलता डोमेन लेना आम तरीका है।",
    },
  },
  many_hyphens: {
    title: {
      en: "The domain name contains several hyphens",
      hi: "डोमेन नाम में कई हाइफ़न हैं",
    },
    explanation: {
      en: "Hyphen-stuffed domains such as “sbi-kyc-update” are built to read like a sentence while not being the real site.",
      hi: "“sbi-kyc-update” जैसे हाइफ़न वाले डोमेन वाक्य जैसा पढ़ने में आते हैं, पर असली साइट नहीं होते।",
    },
  },
  brand_lookalike: {
    title: {
      en: "A well-known brand name appears, but the domain belongs to someone else",
      hi: "जाना-पहचाना ब्रांड नाम है, पर डोमेन किसी और का है",
    },
    explanation: {
      en: "The real company owns its own domain. If the brand name sits inside a different domain, the page is not run by that company.",
      hi: "असली कंपनी का अपना डोमेन होता है। अगर ब्रांड नाम किसी दूसरे डोमेन के अंदर है, तो वह पेज उस कंपनी का नहीं है।",
    },
  },
  deceptive_official_suffix: {
    title: {
      en: "The address imitates an official suffix inside a non-official domain",
      hi: "पता सरकारी जैसा हिस्सा दिखाता है, पर डोमेन सरकारी नहीं है",
    },
    explanation: {
      en: "Government bodies use their own domains, never a subdomain of somebody else's. An official-looking word inside a private domain is a disguise.",
      hi: "सरकारी निकाय अपने डोमेन इस्तेमाल करते हैं, किसी और के डोमेन का सबडोमेन कभी नहीं। निजी डोमेन में सरकारी जैसा शब्द सिर्फ़ भ्रम फैलाता है।",
    },
  },
  phishing_path_vocabulary: {
    title: {
      en: "The address path reads like an account-security page",
      hi: "पते का रास्ता खाता-सुरक्षा पेज जैसा लगता है",
    },
    explanation: {
      en: "Words like verify, login, kyc and update appear far more often in phishing links than in genuine ones — though many real pages use them too, so treat this as a weak signal.",
      hi: "verify, login, kyc और update जैसे शब्द फ़िशिंग लिंक में ज़्यादा दिखते हैं — पर असली पेज भी इस्तेमाल करते हैं, इसलिए इसे कमज़ोर संकेत मानें।",
    },
  },
  very_long_hostname: {
    title: {
      en: "The domain name is unusually long",
      hi: "डोमेन नाम असामान्य रूप से लंबा है",
    },
    explanation: {
      en: "Very long domains are hard to read at a glance, which is exactly why they are used to hide the real domain.",
      hi: "बहुत लंबे डोमेन एक नज़र में पढ़ना कठिन होता है, इसीलिए असली डोमेन छिपाने के लिए इनका उपयोग होता है।",
    },
  },
};
