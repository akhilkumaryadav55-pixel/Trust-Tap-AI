import type { Bi } from "@/lib/analysis/rules/types";

/**
 * Learning Center content.
 *
 * Every example in this file is FICTIONAL and written for teaching. The UI
 * labels them as educational samples and never presents them as real reports or
 * verified cases. Nothing here claims to be a statistic.
 */

export type QuizQuestion = {
  question: Bi;
  options: Bi[];
  correctIndex: number;
  explanation: Bi;
};

export type LearningTopic = {
  slug: string;
  title: Bi;
  summary: Bi;
  minutes: number;
  explanation: { en: string[]; hi: string[] };
  example: Bi;
  warningSigns: { en: string[]; hi: string[] };
  saferActions: { en: string[]; hi: string[] };
  quiz: QuizQuestion[];
};

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    slug: "fake-jobs",
    title: { en: "Fake job and internship offers", hi: "नकली नौकरी और इंटर्नशिप ऑफ़र" },
    summary: {
      en: "Work-from-home offers that ask you to pay first, or that pay you for easy tasks before demanding a deposit.",
      hi: "घर से काम के ऐसे ऑफ़र जो पहले पैसे माँगते हैं, या आसान काम के पैसे देकर बाद में जमा माँगते हैं।",
    },
    minutes: 3,
    explanation: {
      en: [
        "Two versions are common. The first simply asks for money up front — a registration fee, a 'refundable' security deposit, a training kit or documentation charge. Any employer who wants money from you is not an employer.",
        "The second is slower and more convincing. You really are paid small amounts for liking videos, reviewing hotels or completing simple tasks. Once you trust them, the work changes to a 'prepaid task' or 'investment' — and the money you put in does not come back.",
        "A genuine recruiter contacts you about a role you applied for, from a company email domain, and never asks you to move the conversation to a personal WhatsApp number on the first message.",
      ],
      hi: [
        "दो तरह के मामले आम हैं। पहला सीधे पैसे माँगता है — रजिस्ट्रेशन शुल्क, 'वापस मिलने वाला' सिक्योरिटी डिपॉज़िट, ट्रेनिंग किट या दस्तावेज़ शुल्क। जो नियोक्ता आपसे पैसे माँगे, वह नियोक्ता नहीं है।",
        "दूसरा धीमा और ज़्यादा भरोसेमंद लगता है। वीडियो लाइक करने, होटल रिव्यू या आसान काम के लिए सच में छोटी रकम मिलती है। भरोसा बनने पर काम 'प्रीपेड टास्क' या 'निवेश' में बदल जाता है — और आपके लगाए पैसे वापस नहीं आते।",
        "असली भर्तीकर्ता उसी पद के लिए संपर्क करता है जिसके लिए आपने आवेदन किया था, कंपनी के ईमेल डोमेन से, और पहले ही संदेश में निजी WhatsApp नंबर पर बात करने को नहीं कहता।",
      ],
    },
    example: {
      en: "\"Congratulations! Your resume is selected for a work-from-home data entry job. Salary Rs 35,000/month. Pay a refundable registration fee of Rs 1,499 to confirm your seat, and share your Aadhaar and bank details.\"",
      hi: "\"बधाई! आपका रिज़्यूमे घर से डेटा एंट्री की नौकरी के लिए चुना गया है। वेतन ₹35,000/माह। सीट पक्की करने के लिए ₹1,499 का वापस मिलने वाला रजिस्ट्रेशन शुल्क भेजें, और आधार व बैंक जानकारी साझा करें।\"",
    },
    warningSigns: {
      en: [
        "You are asked to pay a fee, deposit or 'refundable' charge before joining.",
        "You never applied, or never interviewed, yet you are 'selected'.",
        "The salary is very high for a very simple, unskilled task.",
        "The conversation happens only on WhatsApp or Telegram, never a company email.",
        "A document (agreement, appointment letter) is sent as an image and looked at only briefly.",
      ],
      hi: [
        "जॉइनिंग से पहले शुल्क, डिपॉज़िट या 'वापस मिलने वाला' पैसा माँगा जाए।",
        "आपने न आवेदन किया, न इंटरव्यू दिया — फिर भी आप 'चुने गए' हैं।",
        "बहुत आसान, बिना कौशल वाले काम के लिए बहुत ऊँचा वेतन।",
        "बातचीत केवल WhatsApp या Telegram पर हो, कंपनी के ईमेल पर कभी नहीं।",
        "कोई अनुबंध या नियुक्ति पत्र सिर्फ़ फ़ोटो के रूप में भेजा जाए।",
      ],
    },
    saferActions: {
      en: [
        "Search the company's own careers page and check whether the role is listed there.",
        "Check that the email domain matches the company's real website.",
        "Ask for the recruiter's official phone number and call the company's published switchboard.",
        "Never send money to get a job — no genuine employer requires it.",
      ],
      hi: [
        "कंपनी के करियर पेज पर देखें कि वह पद वहाँ सूचीबद्ध है या नहीं।",
        "जाँचें कि ईमेल डोमेन कंपनी की असली वेबसाइट से मेल खाता है।",
        "भर्तीकर्ता का आधिकारिक नंबर माँगें और कंपनी के प्रकाशित नंबर पर कॉल करें।",
        "नौकरी पाने के लिए पैसे कभी न भेजें — कोई असली नियोक्ता ऐसा नहीं माँगता।",
      ],
    },
    quiz: [
      {
        question: {
          en: "A recruiter asks for a Rs 1,000 'refundable' deposit before joining. What does that tell you?",
          hi: "भर्तीकर्ता जॉइनिंग से पहले ₹1,000 का 'वापस मिलने वाला' डिपॉज़िट माँगता है। इससे क्या पता चलता है?",
        },
        options: [
          {
            en: "It is normal for a security deposit to be taken at joining.",
            hi: "जॉइनिंग पर सिक्योरिटी डिपॉज़िट लेना सामान्य है।",
          },
          {
            en: "It is a strong sign of fraud — real employers never charge you.",
            hi: "यह ठगी का मज़बूत संकेत है — असली नियोक्ता आपसे शुल्क नहीं लेते।",
          },
          {
            en: "It is fine as long as you get a receipt.",
            hi: "अगर रसीद मिल जाए तो कोई दिक्कत नहीं।",
          },
        ],
        correctIndex: 1,
        explanation: {
          en: "Money flowing from the candidate to the 'employer' is the defining feature of a job scam. No legitimate employer charges a joining or registration fee.",
          hi: "उम्मीदवार से 'नियोक्ता' तक पैसा जाना नौकरी ठगी की पहचान है। कोई असली नियोक्ता जॉइनिंग या रजिस्ट्रेशन शुल्क नहीं लेता।",
        },
      },
      {
        question: {
          en: "You are paid Rs 200 for liking videos, then told to deposit Rs 5,000 for 'higher tasks'. What is happening?",
          hi: "वीडियो लाइक करने पर ₹200 मिले, फिर 'बड़े टास्क' के लिए ₹5,000 जमा करने को कहा गया। क्या हो रहा है?",
        },
        options: [
          {
            en: "A normal performance-based progression.",
            hi: "यह सामान्य प्रदर्शन-आधारित प्रगति है।",
          },
          {
            en: "The small payments were bait to build trust before the real loss.",
            hi: "छोटे भुगतान भरोसा बनाने का चारा थे, असली नुकसान आगे है।",
          },
          {
            en: "You should deposit more to withdraw the balance.",
            hi: "बैलेंस निकालने के लिए और जमा करना चाहिए।",
          },
        ],
        correctIndex: 1,
        explanation: {
          en: "Paying a small real amount first is a standard trust-building step. Any request to deposit your own money to 'unlock' earnings is the fraud itself.",
          hi: "पहले छोटी असली रकम देना भरोसा बनाने का आम तरीका है। कमाई 'खोलने' के लिए अपने पैसे जमा करने की माँग ही ठगी है।",
        },
      },
    ],
  },
  {
    slug: "fake-scholarships",
    title: { en: "Fake scholarships and prizes", hi: "नकली छात्रवृत्ति और इनाम" },
    summary: {
      en: "Benefit, scholarship and prize messages that need a fee, a link, or your bank details.",
      hi: "ऐसे लाभ, छात्रवृत्ति और इनाम के संदेश जिनमें शुल्क, लिंक या बैंक जानकारी माँगी जाती है।",
    },
    minutes: 3,
    explanation: {
      en: [
        "You cannot win a draw you never entered. Prize, lottery and lucky-customer messages exist to move you to a payment or to a bank-detail form.",
        "Government scholarships and benefits are announced on official portals and credited directly to your own bank account. A private link that asks for a processing fee, a GST payment or your card details for a 'benefit transfer' is not a benefit.",
        "'Small fee to release a large amount' is the single most reliable indicator of this whole family of frauds. If a prize genuinely exists, it is never conditional on you paying first.",
      ],
      hi: [
        "जिस ड्रॉ में आपने भाग ही नहीं लिया, उसे जीत नहीं सकते। इनाम, लॉटरी और 'लकी ग्राहक' संदेश आपको भुगतान या बैंक जानकारी के फ़ॉर्म तक ले जाने के लिए होते हैं।",
        "सरकारी छात्रवृत्ति और लाभ आधिकारिक पोर्टल पर घोषित होते हैं और सीधे आपके बैंक खाते में आते हैं। निजी लिंक से प्रोसेसिंग शुल्क, GST या कार्ड जानकारी माँगना किसी लाभ का हिस्सा नहीं है।",
        "'बड़ी रकम पाने के लिए छोटा शुल्क' इस पूरे परिवार की ठगी का सबसे भरोसेमंद संकेत है। असली इनाम कभी पहले पैसे देने की शर्त पर नहीं होता।",
      ],
    },
    example: {
      en: "\"You have won Rs 25,00,000 in the KBC lucky draw. To claim your prize, pay Rs 5,000 as GST and send your account number and IFSC code.\"",
      hi: "\"आपने KBC लकी ड्रॉ में ₹25,00,000 जीते हैं। इनाम पाने के लिए ₹5,000 GST जमा करें और अपना खाता संख्या व IFSC कोड भेजें।\"",
    },
    warningSigns: {
      en: [
        "You are told you won something you never entered.",
        "A tax, GST, clearance or processing payment is required first.",
        "Your bank details or a card are requested to 'transfer' the prize.",
        "A deadline of hours or the same day is attached.",
        "The message arrives from a personal number or an email that is not on the organisation's own domain.",
      ],
      hi: [
        "आपने जिसमें भाग नहीं लिया, उसे जीतने की बात कही जाए।",
        "पहले टैक्स, GST, क्लीयरेंस या प्रोसेसिंग भुगतान माँगा जाए।",
        "इनाम 'भेजने' के लिए बैंक जानकारी या कार्ड माँगा जाए।",
        "घंटों या उसी दिन की समय सीमा जोड़ी जाए।",
        "संदेश व्यक्तिगत नंबर या संस्था के डोमेन से अलग ईमेल से आए।",
      ],
    },
    saferActions: {
      en: [
        "Check official portals directly for any scheme you are entitled to.",
        "Remember: benefits are credited to your account; you never pay to receive them.",
        "Delete the message and block the sender rather than replying.",
      ],
      hi: [
        "जिस योजना का आप हकदार हैं, उसकी जानकारी सीधे आधिकारिक पोर्टल पर देखें।",
        "याद रखें: लाभ आपके खाते में आता है; उसे पाने के लिए आप पैसे नहीं देते।",
        "जवाब देने के बजाय संदेश हटाएँ और भेजने वाले को ब्लॉक करें।",
      ],
    },
    quiz: [
      {
        question: {
          en: "A message says you won a prize but must pay Rs 5,000 to release it. What is the most reliable interpretation?",
          hi: "संदेश कहता है कि आपने इनाम जीता है पर उसे पाने के लिए ₹5,000 देने होंगे। सबसे भरोसेमंद निष्कर्ष क्या है?",
        },
        options: [
          { en: "It could be genuine if the amount is small.", hi: "अगर रकम छोटी हो तो यह असली हो सकता है।" },
          { en: "You should pay and see what happens.", hi: "भुगतान करके देख लेना चाहिए।" },
          {
            en: "It is a scam. Genuine prizes never require an upfront payment.",
            hi: "यह ठगी है। असली इनाम में पहले भुगतान कभी नहीं माँगा जाता।",
          },
        ],
        correctIndex: 2,
        explanation: {
          en: "The requirement to pay first is the fraud. The prize does not exist.",
          hi: "पहले भुगतान की शर्त ही ठगी है। इनाम का कोई अस्तित्व नहीं होता।",
        },
      },
    ],
  },
  {
    slug: "phishing",
    title: { en: "Phishing messages", hi: "फ़िशिंग संदेश" },
    summary: {
      en: "Messages built to look like a company you trust so you hand over a password on a lookalike page.",
      hi: "भरोसेमंद कंपनी जैसे दिखने वाले संदेश, ताकि नकली पेज पर पासवर्ड दिया जाए।",
    },
    minutes: 3,
    explanation: {
      en: [
        "Phishing works by copying the look of a real message and pointing the link somewhere else. The message can be genuinely well written and often names you correctly — much of your information is already public after a leak somewhere.",
        "The decisive question is not 'does this look real?' but 'did I ask for this, and does the address actually belong to this company?'. Read the domain, not the display name, and not the logo.",
        "Phishing almost always ends in the same place: a page asking for a password, an OTP, a card number or a UPI PIN. Any page reached from a message that asks for any of those is a page you close.",
      ],
      hi: [
        "फ़िशिंग असली संदेश की नकल करके लिंक कहीं और ले जाती है। संदेश सच में अच्छी भाषा में हो सकता है और अक्सर आपका नाम सही लिखता है — कहीं लीक हुए डेटा से आपकी जानकारी पहले से सार्वजनिक है।",
        "असली सवाल यह नहीं कि 'यह असली लगता है?', बल्कि यह कि 'क्या मैंने इसे माँगा था, और पता सच में इस कंपनी का है?'. डोमेन पढ़ें, नाम या लोगो नहीं।",
        "फ़िशिंग लगभग हमेशा एक ही जगह पहुँचती है: एक पेज जो पासवर्ड, OTP, कार्ड नंबर या UPI पिन माँगता है। संदेश से पहुँचे किसी ऐसे पेज को बंद कर दें।",
      ],
    },
    example: {
      en: "\"Dear Customer, we detected an unauthorised login to your account. Verify immediately at https://secure-netbanking-verify.top/login to avoid suspension.\"",
      hi: "\"प्रिय ग्राहक, आपके खाते में अनधिकृत लॉगिन पाया गया। निलंबन से बचने के लिए तुरंत https://secure-netbanking-verify.top/login पर सत्यापित करें।\"",
    },
    warningSigns: {
      en: [
        "The domain is not the company's real domain, even if it contains its name.",
        "A link arrives with urgency: verify now, update today, account will be closed.",
        "The page asks for a password, OTP, PIN or card details.",
        "The greeting is generic, or the sender's address has odd extra words and numbers.",
        "You are asked to confirm something you never requested.",
      ],
      hi: [
        "डोमेन कंपनी का असली डोमेन नहीं है, भले उसमें उसका नाम हो।",
        "लिंक के साथ जल्दी का दबाव हो: अभी सत्यापित करें, आज अपडेट करें, खाता बंद हो जाएगा।",
        "पेज पासवर्ड, OTP, पिन या कार्ड जानकारी माँगे।",
        "संबोधन सामान्य हो, या भेजने वाले के पते में अजीब अतिरिक्त शब्द और अंक हों।",
        "आपसे वह चीज़ पुष्टि करने को कही जाए जो आपने कभी माँगी ही नहीं।",
      ],
    },
    saferActions: {
      en: [
        "Do not click. Open the company's app, or type their official address yourself.",
        "Compare the domain letter by letter with the one on your card or statement.",
        "Turn on two-factor authentication so a stolen password is not enough on its own.",
      ],
      hi: [
        "क्लिक न करें। कंपनी का ऐप खोलें, या उनका आधिकारिक पता खुद टाइप करें।",
        "डोमेन की तुलना अपने कार्ड या स्टेटमेंट पर लिखे डोमेन से अक्षर-दर-अक्षर करें।",
        "दो-चरणीय प्रमाणीकरण चालू करें ताकि चोरी हुआ पासवर्ड अकेले काफ़ी न हो।",
      ],
    },
    quiz: [
      {
        question: {
          en: "A link reads https://icicibank.com.secure-verify.top/login. Is it ICICI Bank's website?",
          hi: "लिंक है https://icicibank.com.secure-verify.top/login. क्या यह ICICI बैंक की वेबसाइट है?",
        },
        options: [
          { en: "Yes — icicibank.com appears in the address.", hi: "हाँ — पते में icicibank.com दिख रहा है।" },
          { en: "Yes, because it uses https.", hi: "हाँ, क्योंकि इसमें https है।" },
          {
            en: "No — the real domain is secure-verify.top. The bank name is just a subdomain.",
            hi: "नहीं — असली डोमेन secure-verify.top है। बैंक का नाम सिर्फ़ सबडोमेन है।",
          },
        ],
        correctIndex: 2,
        explanation: {
          en: "The registrable domain is what matters: everything to the left of it is controlled by whoever owns that domain. Here, secure-verify.top owns the page.",
          hi: "असली डोमेन ही मायने रखता है: उसके बाईं ओर का सब कुछ उसी के नियंत्रण में होता है जो वह डोमेन रखता है। यहाँ पेज secure-verify.top का है।",
        },
      },
      {
        question: {
          en: "A phishing page asks you to enter an OTP 'to cancel a fraudulent transaction'. What should you do?",
          hi: "फ़िशिंग पेज 'फ़र्ज़ी लेन-देन रद्द करने' के लिए OTP डालने को कहता है। क्या करें?",
        },
        options: [
          { en: "Enter it — cancelling fraud sounds helpful.", hi: "डाल दें — ठगी रद्द करना मददगार लगता है।" },
          {
            en: "Close the page. The OTP would authorise, not cancel, a transaction.",
            hi: "पेज बंद करें। OTP लेन-देन रद्द नहीं करता, वह उसे मंज़ूरी देता है।",
          },
          { en: "Enter a wrong OTP to test the page.", hi: "गलत OTP डालकर पेज जाँच लें।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "An OTP authorises an action that is already in progress. Nothing about 'cancelling' requires one.",
          hi: "OTP उस कार्रवाई को मंज़ूरी देता है जो पहले से चल रही है। 'रद्द करने' के लिए OTP की ज़रूरत कभी नहीं होती।",
        },
      },
    ],
  },
  {
    slug: "fake-kyc",
    title: { en: "Fake bank KYC messages", hi: "नकली बैंक KYC संदेश" },
    summary: {
      en: "The most-reported banking fraud message in India: KYC expiring today, update or your account is blocked.",
      hi: "भारत में सबसे ज़्यादा रिपोर्ट किया जाने वाला बैंकिंग ठगी संदेश: आज KYC समाप्त, नहीं तो खाता बंद।",
    },
    minutes: 2,
    explanation: {
      en: [
        "KYC is a real requirement, which is exactly why this message works. Banks update KYC at a branch, through their own app, or through a verified representative — never through an SMS link.",
        "The message pairs two pressures: a deadline ('today') and a consequence ('account blocked'). Both are chosen to stop you checking with the bank first.",
        "If your KYC really is pending, your bank will also show it inside its own app or when you visit or call them on their published number. Start from that side, never from the message.",
      ],
      hi: [
        "KYC एक असली ज़रूरत है, इसीलिए यह संदेश काम करता है। बैंक KYC शाखा में, अपने ऐप से, या सत्यापित प्रतिनिधि से अपडेट करते हैं — SMS लिंक से कभी नहीं।",
        "संदेश दो दबाव जोड़ता है: समय सीमा ('आज') और परिणाम ('खाता बंद')। दोनों इसलिए चुने जाते हैं ताकि आप पहले बैंक से पुष्टि न कर सकें।",
        "अगर सच में KYC लंबित है, तो वह बैंक के अपने ऐप में या प्रकाशित नंबर पर कॉल करने पर दिखेगा। शुरुआत उसी तरफ़ से करें, संदेश से नहीं।",
      ],
    },
    example: {
      en: "\"Dear Customer, your KYC will expire today and your account will be blocked. Update now: http://sbi-kyc-update.xyz/verify and share the OTP you receive.\"",
      hi: "\"प्रिय ग्राहक, आपका KYC आज समाप्त हो रहा है और खाता बंद कर दिया जाएगा। अभी अपडेट करें: http://sbi-kyc-update.xyz/verify और मिला हुआ OTP बताएँ।\"",
    },
    warningSigns: {
      en: [
        "A link to update KYC, instead of the bank's own app or branch.",
        "The domain is not the bank's real domain (a lookalike with hyphens or a cheap extension).",
        "You are asked to share an OTP, PIN or card details to 'complete' KYC.",
        "'Today' or 'within 24 hours' combined with 'account will be blocked'.",
        "The message comes from a normal 10-digit mobile number, not the bank's official sender ID.",
      ],
      hi: [
        "KYC अपडेट के लिए लिंक दिया जाए, बैंक का ऐप या शाखा नहीं।",
        "डोमेन बैंक का असली डोमेन न हो (हाइफ़न या सस्ती एक्सटेंशन वाला मिलता-जुलता नाम)।",
        "KYC 'पूरा' करने के लिए OTP, पिन या कार्ड जानकारी माँगी जाए।",
        "'आज' या '24 घंटे में' के साथ 'खाता बंद हो जाएगा' लिखा हो।",
        "संदेश सामान्य 10 अंकों के मोबाइल नंबर से आए, बैंक की आधिकारिक सेंडर आईडी से नहीं।",
      ],
    },
    saferActions: {
      en: [
        "Open your bank's own app and check for any KYC notice there.",
        "Call the number on your card, passbook or the bank's official website.",
        "If you are due for KYC, do it at a branch or through the bank's verified channel.",
      ],
      hi: [
        "अपने बैंक का ऐप खोलकर वहाँ KYC से जुड़ी कोई सूचना देखें।",
        "कार्ड, पासबुक या बैंक की आधिकारिक वेबसाइट पर दिए नंबर पर कॉल करें।",
        "अगर KYC बाकी है, तो शाखा में या बैंक के सत्यापित माध्यम से कराएँ।",
      ],
    },
    quiz: [
      {
        question: {
          en: "An SMS says your KYC expires today and asks you to share the OTP to complete it. What is the safest reading?",
          hi: "SMS कहता है आज KYC समाप्त और पूरा करने के लिए OTP साझा करें। सबसे सुरक्षित निष्कर्ष?",
        },
        options: [
          { en: "Share it, because KYC is genuinely required.", hi: "साझा करें, क्योंकि KYC सच में ज़रूरी है।" },
          {
            en: "It is a scam — sharing an OTP never completes a KYC.",
            hi: "यह ठगी है — OTP साझा करने से KYC कभी पूरा नहीं होता।",
          },
          { en: "Reply STOP to unsubscribe and then share it.", hi: "पहले STOP भेजें, फिर साझा करें।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "No KYC process consumes an OTP you read out over a message. The OTP is being harvested to authorise a transaction or log in.",
          hi: "किसी KYC प्रक्रिया में संदेश से बताया गया OTP इस्तेमाल नहीं होता। वह OTP लेन-देन या लॉगिन की मंज़ूरी के लिए लिया जा रहा है।",
        },
      },
    ],
  },
  {
    slug: "upi-requests",
    title: { en: "UPI payment-request tricks", hi: "UPI भुगतान अनुरोध की तरकीबें" },
    summary: {
      en: "Why entering your UPI PIN or approving a request always sends money — never receives it.",
      hi: "UPI पिन डालना या अनुरोध स्वीकारना हमेशा पैसे भेजता है — कभी प्राप्त नहीं करता।",
    },
    minutes: 3,
    explanation: {
      en: [
        "Receiving money on UPI requires no action from you at all. Money simply arrives. The only things a PIN does are send money, or authorise a mandate.",
        "Two tricks dominate. In the first, a buyer for your item 'sends' you a request; you enter your PIN believing you are receiving payment, and instead you pay them. In the second, you are told to scan a QR code to receive a refund — scanning and entering a PIN always debits you.",
        "A collect request is a request for you to pay. Read the amount and the direction each time, and treat any instruction to 'enter your PIN to receive' as the fraud itself.",
      ],
      hi: [
        "UPI पर पैसे प्राप्त करने के लिए आपको कुछ करना ही नहीं पड़ता। पैसे अपने आप आ जाते हैं। पिन केवल पैसे भेजता है या मैंडेट को मंज़ूरी देता है।",
        "दो तरकीबें सबसे आम हैं। पहली में, आपकी चीज़ का 'खरीदार' आपको अनुरोध भेजता है; आप पैसे मिलने की उम्मीद में पिन डालते हैं और असल में पैसे चले जाते हैं। दूसरी में, रिफ़ंड लेने के लिए QR स्कैन करने को कहा जाता है — स्कैन करके पिन डालने पर हमेशा आपके पैसे कटते हैं।",
        "Collect अनुरोध का मतलब है आपसे भुगतान माँगा जा रहा है। हर बार राशि और दिशा पढ़ें, और 'पैसे लेने के लिए पिन डालें' को ठगी ही मानें।",
      ],
    },
    example: {
      en: "\"I want to buy your table. I have sent you a payment request — just approve it and enter your UPI PIN to receive Rs 8,000 in your account.\"",
      hi: "\"मुझे आपकी मेज़ खरीदनी है। मैंने भुगतान अनुरोध भेज दिया है — उसे स्वीकार करके UPI पिन डालें और ₹8,000 आपके खाते में आ जाएँगे।\"",
    },
    warningSigns: {
      en: [
        "You are told to enter a PIN, or approve a request, in order to RECEIVE money.",
        "A QR code is offered as the way for you to get a refund or a payment.",
        "The amount shown is money leaving your account, not arriving.",
        "The buyer refuses to meet, insists on speed, and will not discuss the item.",
        "You are told the payment is 'stuck' and asked to try again.",
      ],
      hi: [
        "पैसे 'प्राप्त' करने के लिए पिन डालने या अनुरोध स्वीकारने को कहा जाए।",
        "रिफ़ंड या भुगतान पाने का तरीका QR कोड बताया जाए।",
        "दिखाई देने वाली राशि आपके खाते में आने की नहीं, जाने की हो।",
        "खरीदार मिलने से मना करे, जल्दी पर ज़ोर दे, और चीज़ पर बात न करे।",
        "कहा जाए कि भुगतान 'अटक' गया है और दोबारा कोशिश करने को कहें।",
      ],
    },
    saferActions: {
      en: [
        "Remember the rule: PIN sends money, never receives it.",
        "Read the direction and amount on every request before approving.",
        "For a sale, accept cash in person, or wait until the amount appears in your own bank balance.",
      ],
      hi: [
        "नियम याद रखें: पिन पैसे भेजता है, कभी प्राप्त नहीं करता।",
        "हर अनुरोध को स्वीकार करने से पहले दिशा और राशि पढ़ें।",
        "बिक्री के लिए, आमने-सामने नकद लें, या अपने बैंक बैलेंस में राशि दिखने का इंतज़ार करें।",
      ],
    },
    quiz: [
      {
        question: {
          en: "Someone says they sent you a UPI request and you must enter your PIN to receive Rs 8,000. What happens if you do?",
          hi: "कोई कहता है कि उसने UPI अनुरोध भेजा है और ₹8,000 पाने के लिए पिन डालना है। डालने पर क्या होगा?",
        },
        options: [
          { en: "You receive Rs 8,000.", hi: "आपको ₹8,000 मिल जाएँगे।" },
          { en: "Nothing happens until they confirm.", hi: "उनके पुष्टि करने तक कुछ नहीं होगा।" },
          {
            en: "You pay them Rs 8,000 — entering a PIN authorises a debit.",
            hi: "आप उन्हें ₹8,000 भेज देंगे — पिन डालने से पैसे कट जाते हैं।",
          },
        ],
        correctIndex: 2,
        explanation: {
          en: "A UPI PIN authorises a debit or a mandate. It is never needed to receive money.",
          hi: "UPI पिन पैसे कटने या मैंडेट को मंज़ूरी देता है। पैसे प्राप्त करने के लिए यह कभी नहीं चाहिए।",
        },
      },
      {
        question: {
          en: "Is scanning a QR code and entering your PIN ever needed to receive a refund?",
          hi: "रिफ़ंड पाने के लिए QR स्कैन करके पिन डालना कभी ज़रूरी होता है?",
        },
        options: [
          { en: "Yes, for refunds only.", hi: "हाँ, केवल रिफ़ंड में।" },
          { en: "No — that always debits your account.", hi: "नहीं — इससे हमेशा आपके पैसे कटते हैं।" },
          { en: "Yes, if the QR is from a bank.", hi: "हाँ, अगर QR बैंक का हो।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "Refunds are credited automatically. Any QR-plus-PIN request to 'receive' money is a debit instruction.",
          hi: "रिफ़ंड अपने आप जमा हो जाता है। 'पैसे लेने' के लिए QR के साथ पिन की माँग पैसे कटने का निर्देश है।",
        },
      },
    ],
  },
  {
    slug: "official-impersonation",
    title: {
      en: "Impersonation of government officials",
      hi: "सरकारी अधिकारियों की नकली पहचान",
    },
    summary: {
      en: "Fake police, tax, customs and 'digital arrest' calls that demand a payment to close a case.",
      hi: "नकली पुलिस, कर, सीमा शुल्क और 'डिजिटल अरेस्ट' कॉल जो मामला बंद करने के लिए भुगतान माँगती हैं।",
    },
    minutes: 3,
    explanation: {
      en: [
        "Real agencies do not open an investigation over a phone or video call, do not send notices as WhatsApp images, and never demand money to avoid an arrest. A genuine notice arrives in writing and can be verified at the office that issued it.",
        "'Digital arrest' is a name invented by fraudsters. Callers dress as police, appear on video in uniform, show forged letters, and keep the conversation going for hours so you cannot think or consult anyone. The one non-negotiable demand is always a transfer.",
        "The single most useful rule: if a call asks you to pay to avoid arrest, or to keep it secret from your family, it is fraud. Hang up.",
      ],
      hi: [
        "असली एजेंसियाँ फ़ोन या वीडियो कॉल पर जाँच शुरू नहीं करतीं, नोटिस WhatsApp तस्वीर के रूप में नहीं भेजतीं, और गिरफ्तारी से बचने के लिए पैसे नहीं माँगतीं। असली नोटिस लिखित में आता है और जारी करने वाले दफ़्तर से सत्यापित किया जा सकता है।",
        "'डिजिटल अरेस्ट' शब्द ठगों ने बनाया है। कॉल करने वाले पुलिस की वर्दी में वीडियो पर आते हैं, नकली पत्र दिखाते हैं, और घंटों बातचीत चलाते हैं ताकि आप सोच न सकें या किसी से पूछ न सकें। एक माँग कभी नहीं बदलती — पैसे भेजना।",
        "सबसे उपयोगी नियम: अगर कॉल में गिरफ्तारी से बचने के लिए पैसे माँगे जाएँ, या परिवार से छिपाने को कहा जाए, तो वह ठगी है। कॉल काट दें।",
      ],
    },
    example: {
      en: "\"This is the CBI. A parcel in your name contained illegal items. A non-bailable case is registered. Pay Rs 50,000 as a verification deposit to close it, and do not tell your family or the case will proceed.\"",
      hi: "\"यह CBI है। आपके नाम के पार्सल में अवैध सामान मिला है। गैर-जमानती मामला दर्ज है। इसे बंद करने के लिए ₹50,000 सत्यापन जमा करें, और परिवार को न बताएँ वरना मामला बढ़ जाएगा।\"",
    },
    warningSigns: {
      en: [
        "You are told you will be arrested, or a case is already registered against you.",
        "A payment is demanded to 'clear your name' or 'close the case'.",
        "You are told not to tell your family or your bank.",
        "The call continues for hours and you are discouraged from hanging up.",
        "Documents are shown on video but cannot be verified, and the number is not an official one.",
      ],
      hi: [
        "कहा जाए कि आप गिरफ्तार होंगे, या आपके खिलाफ मामला दर्ज है।",
        "नाम 'साफ़' करने या 'मामला बंद' करने के लिए पैसे माँगे जाएँ।",
        "परिवार या बैंक को न बताने को कहा जाए।",
        "कॉल घंटों चले और फ़ोन काटने से रोका जाए।",
        "वीडियो पर दस्तावेज़ दिखाए जाएँ पर सत्यापित न हो सकें, और नंबर आधिकारिक न हो।",
      ],
    },
    saferActions: {
      en: [
        "Hang up and confirm independently with the office that claims to have written to you.",
        "Talk to a family member or a lawyer before doing anything.",
        "Report the number: impersonation calls are investigated.",
      ],
      hi: [
        "कॉल काटें और जिस दफ़्तर के नाम से बात हो रही है, उससे स्वतंत्र रूप से पुष्टि करें।",
        "कुछ भी करने से पहले परिवार के सदस्य या वकील से बात करें।",
        "नंबर की शिकायत करें: नकली पहचान वाली कॉल की जाँच होती है।",
      ],
    },
    quiz: [
      {
        question: {
          en: "A video call shows a uniformed officer who demands Rs 50,000 to close a case without arrest. What is this?",
          hi: "वीडियो कॉल पर वर्दीधारी अधिकारी बिना गिरफ्तारी मामला बंद करने के लिए ₹50,000 माँगता है। यह क्या है?",
        },
        options: [
          { en: "An official procedure you should comply with quickly.", hi: "एक आधिकारिक प्रक्रिया, जिसे जल्दी पूरा करें।" },
          { en: "A negotiation you should handle through a lawyer.", hi: "एक सौदेबाज़ी, जिसे वकील से कराएँ।" },
          {
            en: "Fraud — no agency demands payment to avoid arrest.",
            hi: "ठगी — कोई एजेंसी गिरफ्तारी से बचने के लिए भुगतान नहीं माँगती।",
          },
        ],
        correctIndex: 2,
        explanation: {
          en: "A uniform on video proves nothing, and payment never closes a case. This is 'digital arrest', a well-documented fraud.",
          hi: "वीडियो पर वर्दी कुछ साबित नहीं करती, और भुगतान से मामला कभी बंद नहीं होता। यही 'डिजिटल अरेस्ट' है, एक प्रसिद्ध ठगी।",
        },
      },
    ],
  },
  {
    slug: "delivery-fees",
    title: { en: "Fake delivery-fee requests", hi: "नकली डिलीवरी शुल्क की माँग" },
    summary: {
      en: "Your parcel is held — pay Rs 25 to release it, and lose your card details.",
      hi: "आपका पार्सल रुका है — छुड़ाने के लिए ₹25 दें, और कार्ड की जानकारी गँवा दें।",
    },
    minutes: 2,
    explanation: {
      en: [
        "A tiny amount is asked for so the payment feels trivial. The goal is the card details entered on the payment page, not the twenty-five rupees.",
        "Couriers collect charges at the door or through the sender, not through links in SMS. If a parcel genuinely needs clearance, the tracking number will work on the courier's own website.",
        "You will often not even be expecting a parcel. That is fine — the fraud depends on curiosity, not on a real order.",
      ],
      hi: [
        "छोटी रकम इसलिए माँगी जाती है ताकि भुगतान मामूली लगे। असली लक्ष्य पच्चीस रुपये नहीं, भुगतान पेज पर डाले जाने वाले कार्ड की जानकारी है।",
        "कूरियर शुल्क दरवाज़े पर या भेजने वाले से लेते हैं, SMS के लिंक से नहीं। अगर सच में क्लीयरेंस चाहिए, तो ट्रैकिंग नंबर कूरियर की अपनी वेबसाइट पर काम करेगा।",
        "अक्सर आपको किसी पार्सल की उम्मीद भी नहीं होती। यह सामान्य है — यह ठगी असली ऑर्डर पर नहीं, उत्सुकता पर चलती है।",
      ],
    },
    example: {
      en: "\"India Post: your parcel is held due to an incomplete address. Pay a re-delivery charge of Rs 25 here to release it: http://indiapost-redelivery.xyz/pay\"",
      hi: "\"India Post: अधूरे पते के कारण आपका पार्सल रोका गया है। छुड़ाने के लिए ₹25 का दोबारा डिलीवरी शुल्क यहाँ दें: http://indiapost-redelivery.xyz/pay\"",
    },
    warningSigns: {
      en: [
        "The domain is not the courier's real domain, even though its name appears.",
        "A small 'redelivery', 'customs' or 'clearance' charge is requested through a link.",
        "The message arrives when you are not expecting anything.",
        "Card details, or a full card number with CVV, are requested for a tiny amount.",
        "There is no working tracking number, or it does not resolve on the courier's own site.",
      ],
      hi: [
        "डोमेन कूरियर का असली डोमेन नहीं हो, भले नाम दिखे।",
        "लिंक के ज़रिए छोटा 'दोबारा डिलीवरी', 'सीमा शुल्क' या 'क्लीयरेंस' शुल्क माँगा जाए।",
        "संदेश तब आए जब आपको किसी चीज़ की उम्मीद ही न हो।",
        "छोटी रकम के लिए कार्ड की जानकारी या पूरा कार्ड नंबर व CVV माँगा जाए।",
        "कोई चलता हुआ ट्रैकिंग नंबर न हो, या वह कूरियर की साइट पर काम न करे।",
      ],
    },
    saferActions: {
      en: [
        "Track your parcel only on the courier's official website or app, typed by you.",
        "Check your orders in the shopping app you actually use.",
        "Never enter card details on a page reached from a message.",
      ],
      hi: [
        "पार्सल ट्रैक करें केवल कूरियर की आधिकारिक वेबसाइट या ऐप पर, जिसे आप खुद टाइप करें।",
        "अपने ऑर्डर उसी शॉपिंग ऐप में देखें जिसे आप वास्तव में इस्तेमाल करते हैं।",
        "संदेश से खुले पेज पर कभी कार्ड की जानकारी न डालें।",
      ],
    },
    quiz: [
      {
        question: {
          en: "Why would a fraudster ask for only Rs 25?",
          hi: "ठग केवल ₹25 क्यों माँगेगा?",
        },
        options: [
          { en: "Because that is the real courier charge.", hi: "क्योंकि यही असली कूरियर शुल्क है।" },
          {
            en: "So the payment feels harmless and you enter your card details.",
            hi: "ताकि भुगतान हानिरहित लगे और आप कार्ड की जानकारी डाल दें।",
          },
          { en: "To test whether your number is active.", hi: "यह जाँचने के लिए कि आपका नंबर चालू है।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "The amount is deliberately trivial. The value to the fraudster is the card details and OTP that follow.",
          hi: "रकम जानबूझकर मामूली रखी जाती है। ठग के लिए असली मूल्य आगे दिए जाने वाले कार्ड विवरण और OTP हैं।",
        },
      },
    ],
  },
  {
    slug: "qr-codes",
    title: { en: "QR-code payment risks", hi: "QR कोड भुगतान के जोखिम" },
    summary: {
      en: "Scanning a code you did not ask for, and entering a PIN, sends money out.",
      hi: "जिस कोड की आपने माँग नहीं की, उसे स्कैन करके पिन डालने से पैसे चले जाते हैं।",
    },
    minutes: 2,
    explanation: {
      en: [
        "A QR code is just an instruction encoded as an image. There is no way to tell by looking at it whether it debits you or credits you — the app tells you after scanning, and only if you read the screen.",
        "Scammers frame it as 'scan to receive' or 'scan for a refund'. In practice, scan-and-PIN always debits. The screen shows the merchant name and amount before you confirm; read it every single time.",
        "Physical stickers placed over a real shop's QR code are a known problem too. When paying a shop, confirm the name shown in your app matches the shop.",
      ],
      hi: [
        "QR कोड बस एक निर्देश है जो तस्वीर के रूप में एन्कोड किया गया है। देखकर पता नहीं चलता कि यह आपसे पैसे काटेगा या देगा — यह स्कैन के बाद ऐप बताता है, और तभी जब आप स्क्रीन पढ़ें।",
        "ठग इसे 'पैसे लेने के लिए स्कैन करें' या 'रिफ़ंड के लिए स्कैन करें' कहते हैं। असल में स्कैन और पिन से हमेशा पैसे कटते हैं। पुष्टि से पहले स्क्रीन पर व्यापारी का नाम और राशि दिखती है; उसे हर बार पढ़ें।",
        "असली दुकान के QR कोड पर चिपकाए गए नकली स्टिकर भी एक ज्ञात समस्या हैं। दुकान पर भुगतान करते समय देखें कि ऐप में दिखने वाला नाम दुकान से मेल खाता है।",
      ],
    },
    example: {
      en: "\"To receive your refund of Rs 2,999, scan this QR code and enter your UPI PIN — the amount will be credited immediately.\"",
      hi: "\"₹2,999 का रिफ़ंड पाने के लिए यह QR कोड स्कैन करें और UPI पिन डालें — राशि तुरंत जमा हो जाएगी।\"",
    },
    warningSigns: {
      en: [
        "You are told to scan in order to RECEIVE money or a refund.",
        "The code arrives as an image in a chat, from someone you do not know.",
        "The recipient name shown in your app does not match the person or shop.",
        "You are hurried, or told the code will expire.",
        "The amount on the confirmation screen is different from what you agreed.",
      ],
      hi: [
        "पैसे या रिफ़ंड 'पाने' के लिए स्कैन करने को कहा जाए।",
        "कोड चैट में तस्वीर के रूप में, किसी अनजान से आए।",
        "ऐप में दिखने वाला प्राप्तकर्ता का नाम व्यक्ति या दुकान से मेल न खाए।",
        "जल्दबाज़ी कराई जाए, या कहा जाए कि कोड ख़त्म हो जाएगा।",
        "पुष्टि स्क्रीन पर राशि तय राशि से अलग हो।",
      ],
    },
    saferActions: {
      en: [
        "Scan only codes you physically asked for, and always read the confirmation screen.",
        "For receiving money, share nothing — money arrives on its own.",
        "When in a shop, check that the app's recipient name matches the shop's name.",
      ],
      hi: [
        "केवल वही कोड स्कैन करें जो आपने खुद माँगा हो, और पुष्टि स्क्रीन हमेशा पढ़ें।",
        "पैसे प्राप्त करने के लिए कुछ साझा न करें — पैसे अपने आप आ जाते हैं।",
        "दुकान में देखें कि ऐप में दिखने वाला नाम दुकान के नाम से मेल खाता है।",
      ],
    },
    quiz: [
      {
        question: {
          en: "A buyer sends you a QR code and says scanning it will credit your account. What will actually happen?",
          hi: "खरीदार QR कोड भेजकर कहता है कि स्कैन करने पर आपके खाते में पैसे आएँगे। असल में क्या होगा?",
        },
        options: [
          { en: "Your account will be credited.", hi: "आपके खाते में पैसे आ जाएँगे।" },
          { en: "Nothing, because receiving needs no QR.", hi: "कुछ नहीं, क्योंकि प्राप्त करने के लिए QR नहीं चाहिए।" },
          {
            en: "Scanning and entering a PIN will debit your account.",
            hi: "स्कैन करके पिन डालने पर आपके खाते से पैसे कट जाएँगे।",
          },
        ],
        correctIndex: 2,
        explanation: {
          en: "Receiving money never requires a scan. A QR code plus a PIN is always a payment instruction from you.",
          hi: "पैसे प्राप्त करने के लिए स्कैन कभी ज़रूरी नहीं। QR कोड और पिन हमेशा आपकी ओर से भुगतान का निर्देश होते हैं।",
        },
      },
    ],
  },
  {
    slug: "investment-crypto",
    title: {
      en: "Investment and cryptocurrency scams",
      hi: "निवेश और क्रिप्टोकरेंसी ठगी",
    },
    summary: {
      en: "Guaranteed returns, trading groups, and fake profit screenshots that end in a withdrawal fee.",
      hi: "गारंटीड रिटर्न, ट्रेडिंग ग्रुप और नकली मुनाफ़े के स्क्रीनशॉट, जो अंत में निकासी शुल्क पर आते हैं।",
    },
    minutes: 3,
    explanation: {
      en: [
        "No investment can guarantee returns. Anyone promising a fixed monthly percentage is either breaking the law, or, far more often, simply taking your money. Regulated advisers must be registered with SEBI and will say so.",
        "The typical arc: you join a Telegram or WhatsApp group, see screenshots of other people's profits, invest a small amount and are allowed to withdraw a little. You invest more. Then a 'tax', 'withdrawal fee' or 'tier upgrade' is required before you can take anything out. It never arrives.",
        "The screenshots are fabricated, the 'analyst' is a role played by a person with several accounts, and the trading dashboard is a web page they control. Check registration, and never pay a fee to withdraw your own money.",
      ],
      hi: [
        "कोई निवेश मुनाफ़े की गारंटी नहीं दे सकता। जो निश्चित मासिक प्रतिशत का वादा करे, वह या तो कानून तोड़ रहा है, या — ज़्यादातर — सिर्फ़ आपके पैसे ले रहा है। पंजीकृत सलाहकारों का SEBI में पंजीकरण होना चाहिए और वे यह बताते हैं।",
        "सामान्य क्रम: आप Telegram या WhatsApp ग्रुप जॉइन करते हैं, दूसरों के मुनाफ़े के स्क्रीनशॉट देखते हैं, थोड़ा निवेश करते हैं और छोटी निकासी कर पाते हैं। फिर ज़्यादा निवेश करते हैं। इसके बाद पैसे निकालने से पहले 'टैक्स', 'निकासी शुल्क' या 'टियर अपग्रेड' माँगा जाता है। पैसे कभी नहीं आते।",
        "स्क्रीनशॉट बनाए हुए होते हैं, 'एनालिस्ट' कई खातों वाला एक ही व्यक्ति होता है, और ट्रेडिंग डैशबोर्ड उनका बनाया वेब पेज होता है। पंजीकरण जाँचें, और अपने ही पैसे निकालने के लिए कभी शुल्क न दें।",
      ],
    },
    example: {
      en: "\"Join our SEBI-registered trading group. Members earn 30% monthly, guaranteed. Start with Rs 10,000. Profits are shown in the app — a 10% withdrawal fee applies when you cash out.\"",
      hi: "\"हमारे SEBI-पंजीकृत ट्रेडिंग ग्रुप से जुड़ें। सदस्यों को 30% मासिक मुनाफ़ा, गारंटीड। ₹10,000 से शुरू करें। मुनाफ़ा ऐप में दिखता है — निकासी पर 10% शुल्क लगेगा।\"",
    },
    warningSigns: {
      en: [
        "Guaranteed, fixed or 'risk-free' returns.",
        "You must pay a tax, fee or upgrade before withdrawing your own money.",
        "Profits are only visible in an app or website they gave you.",
        "Pressure to recruit others, or a commission for doing so.",
        "The 'adviser' will not give a verifiable SEBI registration number.",
        "Everything happens in a Telegram or WhatsApp group rather than a regulated platform.",
      ],
      hi: [
        "गारंटीड, निश्चित या 'जोखिम-मुक्त' रिटर्न।",
        "अपना ही पैसा निकालने से पहले टैक्स, शुल्क या अपग्रेड माँगा जाए।",
        "मुनाफ़ा केवल उसी ऐप या वेबसाइट में दिखे जो उन्होंने दी।",
        "दूसरों को जोड़ने का दबाव, या उस पर कमीशन।",
        "'सलाहकार' सत्यापित SEBI पंजीकरण संख्या न दे।",
        "सब कुछ नियमित प्लेटफ़ॉर्म की जगह Telegram या WhatsApp ग्रुप में हो।",
      ],
    },
    saferActions: {
      en: [
        "Verify the adviser's registration on SEBI's own website before investing.",
        "Treat 'guaranteed returns' as a definitive red flag, not a selling point.",
        "Never pay a fee to withdraw your own funds.",
        "Complain to SEBI SCORES if you have already lost money this way.",
      ],
      hi: [
        "निवेश से पहले SEBI की वेबसाइट पर सलाहकार का पंजीकरण जाँचें।",
        "'गारंटीड रिटर्न' को फ़ायदे की बात नहीं, साफ़ चेतावनी मानें।",
        "अपना पैसा निकालने के लिए कभी शुल्क न दें।",
        "अगर इस तरह पैसा गँवाया है, तो SEBI SCORES पर शिकायत करें।",
      ],
    },
    quiz: [
      {
        question: {
          en: "An app shows a Rs 90,000 profit but requires Rs 9,000 in 'tax' before withdrawal. What is this?",
          hi: "ऐप ₹90,000 का मुनाफ़ा दिखाता है पर निकासी से पहले ₹9,000 'टैक्स' माँगता है। यह क्या है?",
        },
        options: [
          { en: "A standard tax deduction on gains.", hi: "मुनाफ़े पर सामान्य टैक्स कटौती।" },
          {
            en: "Fraud — the profit is a number on their own screen, and the fee is the real theft.",
            hi: "ठगी — मुनाफ़ा उनकी ही स्क्रीन पर एक संख्या है, और शुल्क ही असली चोरी है।",
          },
          { en: "You should pay, since the profit is larger.", hi: "भुगतान कर दें, क्योंकि मुनाफ़ा बड़ा है।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "You never pay to withdraw your own money. The displayed profit exists only in the software they control.",
          hi: "अपना पैसा निकालने के लिए कभी भुगतान नहीं करते। दिखाया गया मुनाफ़ा केवल उनके सॉफ़्टवेयर में है।",
        },
      },
      {
        question: {
          en: "How can you check whether an investment adviser is genuine?",
          hi: "निवेश सलाहकार असली है या नहीं, यह कैसे जाँचें?",
        },
        options: [
          { en: "Ask them for a screenshot of their registration.", hi: "उनसे पंजीकरण का स्क्रीनशॉट माँगें।" },
          {
            en: "Look up their registration number on SEBI's own website.",
            hi: "उनकी पंजीकरण संख्या SEBI की वेबसाइट पर देखें।",
          },
          { en: "Check how many positive reviews they have.", hi: "देखें कि उनकी कितनी अच्छी समीक्षाएँ हैं।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "Verification must come from the regulator's own site, never from documents the person supplies.",
          hi: "सत्यापन नियामक की वेबसाइट से होना चाहिए, उस व्यक्ति के दिए दस्तावेज़ों से कभी नहीं।",
        },
      },
    ],
  },
  {
    slug: "remote-access",
    title: { en: "Remote-access application scams", hi: "रिमोट-एक्सेस ऐप ठगी" },
    summary: {
      en: "Support calls that ask you to install software that shows your screen — and your OTPs.",
      hi: "सहायता के नाम पर ऐसा ऐप इंस्टॉल कराना जो आपकी स्क्रीन और OTP दिखा देता है।",
    },
    minutes: 3,
    explanation: {
      en: [
        "Real support asks you to describe the problem, or sends an engineer. It does not need to see your screen to fix your electricity bill, cancel an order, or reverse a transaction.",
        "With remote access an attacker watches your notifications and screens, so they read your OTP as it arrives, open your banking app, and approve transfers while you watch. Some tools also let them control the device directly.",
        "The reliable detector: anyone who contacts you unexpectedly and asks you to install AnyDesk, TeamViewer, QuickSupport or similar is attacking you. It does not matter how convincing their reason is.",
      ],
      hi: [
        "असली सहायता आपसे समस्या बताने को कहती है, या तकनीशियन भेजती है। बिजली बिल ठीक करने, ऑर्डर रद्द करने या लेन-देन वापस करने के लिए उसे आपकी स्क्रीन देखने की ज़रूरत नहीं होती।",
        "रिमोट एक्सेस देने पर हमलावर आपके नोटिफ़िकेशन और स्क्रीन देखता है, इसलिए OTP आते ही पढ़ लेता है, आपका बैंकिंग ऐप खोलता है, और आपके सामने ही ट्रांसफर मंज़ूर कर देता है। कुछ टूल से वह डिवाइस सीधे चला भी सकता है।",
        "भरोसेमंद पहचान: जो भी बिना बुलाए संपर्क करके AnyDesk, TeamViewer, QuickSupport जैसा ऐप इंस्टॉल करने को कहे, वह हमला कर रहा है। उसका कारण कितना भी विश्वसनीय लगे।",
      ],
    },
    example: {
      en: "\"Ma'am, your electricity bill payment failed and Rs 1,200 is stuck. Install QuickSupport so I can check your screen and process the refund. Please don't hang up.\"",
      hi: "\"मैडम, आपका बिजली बिल भुगतान फेल हो गया और ₹1,200 अटके हैं। QuickSupport इंस्टॉल करें ताकि मैं स्क्रीन देखकर रिफ़ंड कर सकूँ। कॉल मत काटिए।\"",
    },
    warningSigns: {
      en: [
        "You are asked to install AnyDesk, TeamViewer, QuickSupport, RustDesk or similar.",
        "You are asked to share your screen during a call.",
        "'Don't hang up, do it now' while you install something.",
        "The caller knows some of your details, which makes them sound official.",
        "They mention a refund, a failed payment or a stuck transaction that you did not report.",
      ],
      hi: [
        "AnyDesk, TeamViewer, QuickSupport, RustDesk जैसा ऐप इंस्टॉल करने को कहा जाए।",
        "कॉल के दौरान स्क्रीन साझा करने को कहा जाए।",
        "'कॉल मत काटिए, अभी कर दीजिए' कहकर इंस्टॉल कराया जाए।",
        "कॉल करने वाला आपकी कुछ जानकारी जानता हो, जिससे वह आधिकारिक लगे।",
        "वे रिफ़ंड, फेल भुगतान या अटके लेन-देन की बात करें जिसकी शिकायत आपने नहीं की।",
      ],
    },
    saferActions: {
      en: [
        "Never install remote-access software for someone who contacted you.",
        "Hang up and call the company on a number you find yourself.",
        "If you already shared access, end the session, uninstall the app, disconnect from the internet and change your passwords from another device.",
      ],
      hi: [
        "जिसने आपको संपर्क किया हो, उसके लिए रिमोट-एक्सेस ऐप कभी इंस्टॉल न करें।",
        "कॉल काटें और कंपनी को उसी नंबर पर कॉल करें जो आप खुद ढूँढें।",
        "अगर एक्सेस दे दिया है, तो सेशन ख़त्म करें, ऐप हटाएँ, इंटरनेट बंद करें और दूसरे डिवाइस से पासवर्ड बदलें।",
      ],
    },
    quiz: [
      {
        question: {
          en: "A caller offering a refund asks you to install AnyDesk. What is the correct response?",
          hi: "रिफ़ंड देने का दावा करने वाला कॉलर AnyDesk इंस्टॉल करने को कहता है। सही जवाब क्या है?",
        },
        options: [
          { en: "Install it and watch what they do.", hi: "इंस्टॉल करके देखें कि वे क्या करते हैं।" },
          { en: "Install it but hide your banking app.", hi: "इंस्टॉल करें पर बैंकिंग ऐप छिपा दें।" },
          {
            en: "Refuse and hang up — no genuine refund needs remote access.",
            hi: "मना करें और कॉल काटें — किसी असली रिफ़ंड के लिए रिमोट एक्सेस नहीं चाहिए।",
          },
        ],
        correctIndex: 2,
        explanation: {
          en: "Remote access defeats every other protection because the attacker can see your OTP as it arrives.",
          hi: "रिमोट एक्सेस बाकी सभी सुरक्षा को बेकार कर देता है क्योंकि हमलावर OTP आते ही देख लेता है।",
        },
      },
    ],
  },
  {
    slug: "otp-social-engineering",
    title: { en: "OTP and social-engineering attacks", hi: "OTP और सोशल-इंजीनियरिंग हमले" },
    summary: {
      en: "How persuasion, not hacking, gets your one-time code.",
      hi: "हैकिंग नहीं, बल्कि बातों से आपका वन-टाइम कोड कैसे लिया जाता है।",
    },
    minutes: 3,
    explanation: {
      en: [
        "An OTP is not a password you own; it is a key that authorises one specific action, right now. The moment you speak it aloud or forward it, that action can complete.",
        "Attackers rarely break encryption. They create a reason: a delivery that needs confirming, a refund that needs a code, a KYC that will expire, a 'wrong number' who begs you to forward the code you just received. The SMS itself usually says what the code is for — read that line, not the caller's story.",
        "Three habits stop almost all of this: never read a code out, never forward a code, and never approve a request you did not initiate. If someone already has your details, the OTP is the last lock they need — so it is exactly what they will ask for.",
      ],
      hi: [
        "OTP कोई पासवर्ड नहीं है जो आपके पास रहता है; यह अभी, किसी एक कार्रवाई की मंज़ूरी की चाबी है। जिस पल आप उसे बोल देते या भेज देते हैं, वह कार्रवाई पूरी हो सकती है।",
        "हमलावर एन्क्रिप्शन तोड़ते नहीं। वे कारण बनाते हैं: पुष्टि करने वाली डिलीवरी, कोड माँगने वाला रिफ़ंड, समाप्त होता KYC, या 'गलत नंबर' वाला जो अभी आए कोड को भेजने की गुज़ारिश करता है। SMS में आमतौर पर लिखा होता है कि कोड किसलिए है — वह पंक्ति पढ़ें, कॉलर की कहानी नहीं।",
        "तीन आदतें लगभग सब रोक देती हैं: कोड कभी बोलें नहीं, कोड कभी आगे न भेजें, और जो अनुरोध आपने शुरू नहीं किया उसे कभी मंज़ूर न करें। अगर किसी के पास आपकी जानकारी पहले से है, तो OTP उनका आख़िरी ताला है — इसीलिए वे वही माँगेंगे।",
      ],
    },
    example: {
      en: "\"Hello, I'm calling from your bank. There is a suspicious transaction of Rs 12,000 on your card. To stop it, tell me the 6-digit code we just sent to your phone.\"",
      hi: "\"नमस्ते, मैं आपके बैंक से बोल रहा हूँ। आपके कार्ड पर ₹12,000 का संदिग्ध लेन-देन है। उसे रोकने के लिए वह 6 अंकों का कोड बताइए जो अभी आपके फ़ोन पर भेजा है।\"",
    },
    warningSigns: {
      en: [
        "Anyone asks you to read out, type or forward an OTP.",
        "A 'fraud-prevention' call asks you to confirm a code.",
        "A message claims to be a wrong number and asks you to forward your code.",
        "You are told the code is needed to cancel or reverse something.",
        "Pressure to stay on the call while you deal with the code.",
      ],
      hi: [
        "कोई भी आपसे OTP बोलने, टाइप करने या आगे भेजने को कहे।",
        "'ठगी रोकने' वाली कॉल में कोड की पुष्टि करने को कहा जाए।",
        "संदेश कहे कि नंबर गलत लगा और आप अपना कोड आगे भेज दें।",
        "कहा जाए कि कोड कुछ रद्द या वापस करने के लिए चाहिए।",
        "कोड संभालते समय कॉल पर बने रहने का दबाव डाला जाए।",
      ],
    },
    saferActions: {
      en: [
        "Read the SMS: it names the action the code authorises. If that action is not yours, it is an attack.",
        "Never share or forward a code, whoever is asking.",
        "End the call and contact the organisation through a number you find yourself.",
      ],
      hi: [
        "SMS पढ़ें: उसमें लिखा होता है कि कोड किस काम को मंज़ूरी देता है। अगर वह काम आपका नहीं है, तो यह हमला है।",
        "कोड कभी साझा या आगे न भेजें, चाहे कोई भी माँगे।",
        "कॉल ख़त्म करें और संस्था से उसी नंबर पर संपर्क करें जो आप खुद ढूँढें।",
      ],
    },
    quiz: [
      {
        question: {
          en: "A bank 'officer' offers to stop a fraudulent transaction if you share the OTP. What should you do?",
          hi: "बैंक का 'अधिकारी' ठगी वाला लेन-देन रोकने के लिए OTP माँगता है। क्या करें?",
        },
        options: [
          { en: "Share it, since they are trying to help.", hi: "बता दें, क्योंकि वे मदद कर रहे हैं।" },
          {
            en: "Refuse, hang up, and call the bank on its official number.",
            hi: "मना करें, कॉल काटें, और बैंक के आधिकारिक नंबर पर कॉल करें।",
          },
          { en: "Share a wrong OTP to test them.", hi: "गलत OTP बताकर उन्हें परख लें।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "The OTP would authorise exactly the transaction being described. No genuine fraud-prevention process uses a code you read out over the phone.",
          hi: "वह OTP उसी लेन-देन को मंज़ूरी देगा जिसका ज़िक्र हो रहा है। कोई असली ठगी-रोकथाम प्रक्रिया फ़ोन पर बताए गए कोड का उपयोग नहीं करती।",
        },
      },
    ],
  },
  {
    slug: "fake-customer-care",
    title: { en: "Fake customer-support numbers", hi: "नकली कस्टमर केयर नंबर" },
    summary: {
      en: "Search results and comments that send you to someone who will 'fix' your problem for a fee.",
      hi: "सर्च रिज़ल्ट और कमेंट में मिले नंबर, जो शुल्क लेकर 'समस्या हल' करने का दावा करते हैं।",
    },
    minutes: 2,
    explanation: {
      en: [
        "Genuine companies publish support numbers in their own app and website. Fraudsters post convincing numbers in search results, social-media comments and message threads, usually under a post from someone with the same problem you have.",
        "Once you call, you are guided to a payment, a remote-access app, or a 'verification' that needs your card details. The problem you called about is never the point.",
        "The rule that works: find the number inside the company's own app, on your card or statement, or on the domain you typed yourself. Do not use a number that found you.",
      ],
      hi: [
        "असली कंपनियाँ सहायता नंबर अपने ऐप और वेबसाइट पर देती हैं। ठग सर्च रिज़ल्ट, सोशल मीडिया कमेंट और संदेश थ्रेड में विश्वसनीय दिखने वाले नंबर डालते हैं, अक्सर उसी समस्या वाले पोस्ट के नीचे।",
        "कॉल करने के बाद आपको भुगतान, रिमोट-एक्सेस ऐप, या कार्ड जानकारी माँगने वाले 'सत्यापन' तक पहुँचाया जाता है। जिस समस्या के लिए कॉल किया था, वह असली मुद्दा नहीं होता।",
        "जो नियम काम करता है: नंबर कंपनी के ऐप में, अपने कार्ड या स्टेटमेंट पर, या खुद टाइप किए डोमेन पर ढूँढें। जो नंबर खुद आपको मिला हो, उसका उपयोग न करें।",
      ],
    },
    example: {
      en: "\"I had the same problem! Call this customer care number 9XXXXXXXXX on WhatsApp, they fixed my account in 10 minutes.\" — posted as a comment under a company's social media post.",
      hi: "\"मेरे साथ भी यही हुआ था! इस कस्टमर केयर नंबर 9XXXXXXXXX पर WhatsApp करें, उन्होंने 10 मिनट में मेरा खाता ठीक कर दिया।\" — कंपनी की सोशल मीडिया पोस्ट के नीचे कमेंट में।",
    },
    warningSigns: {
      en: [
        "The number came from a comment, a reply, or a search result rather than the company itself.",
        "The 'agent' asks you to continue on WhatsApp.",
        "You are asked to pay a small refundable charge.",
        "You are asked to install an app or share your screen.",
        "They ask for your card number, CVV or OTP to 'verify' you.",
      ],
      hi: [
        "नंबर कंपनी की जगह किसी कमेंट, जवाब या सर्च रिज़ल्ट से मिला हो।",
        "'एजेंट' आपसे WhatsApp पर बात जारी रखने को कहे।",
        "छोटा वापस मिलने वाला शुल्क माँगा जाए।",
        "ऐप इंस्टॉल करने या स्क्रीन साझा करने को कहा जाए।",
        "'सत्यापन' के लिए कार्ड नंबर, CVV या OTP माँगा जाए।",
      ],
    },
    saferActions: {
      en: [
        "Open the company's official app and use the support option inside it.",
        "Use the number on your card, statement or invoice.",
        "Never pay a fee to have a complaint resolved.",
      ],
      hi: [
        "कंपनी का आधिकारिक ऐप खोलें और उसी में दिए सहायता विकल्प का उपयोग करें।",
        "कार्ड, स्टेटमेंट या बिल पर दिया नंबर इस्तेमाल करें।",
        "शिकायत हल कराने के लिए कभी शुल्क न दें।",
      ],
    },
    quiz: [
      {
        question: {
          en: "You find a customer-care number in a comment under a company post. Should you call it?",
          hi: "कंपनी की पोस्ट के नीचे कमेंट में कस्टमर केयर नंबर मिला। क्या उस पर कॉल करें?",
        },
        options: [
          { en: "Yes, if someone says it worked for them.", hi: "हाँ, अगर किसी ने कहा हो कि उसका काम हो गया।" },
          {
            en: "No — use the number published inside the company's own app or website.",
            hi: "नहीं — कंपनी के अपने ऐप या वेबसाइट पर दिया नंबर इस्तेमाल करें।",
          },
          { en: "Yes, but ask them to prove they are official.", hi: "हाँ, पर पहले उनसे आधिकारिक होने का प्रमाण माँगें।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "A comment cannot verify a number; anyone can post one. Verification only comes from the company's own channel.",
          hi: "कमेंट किसी नंबर को सत्यापित नहीं कर सकता; कोई भी पोस्ट कर सकता है। सत्यापन केवल कंपनी के अपने माध्यम से होता है।",
        },
      },
    ],
  },
  {
    slug: "ai-voice-impersonation",
    title: {
      en: "AI-generated voice and identity impersonation",
      hi: "AI से बनी आवाज़ और नकली पहचान",
    },
    summary: {
      en: "A few seconds of audio can now fake a familiar voice — including a relative in trouble.",
      hi: "कुछ सेकंड की आवाज़ से अब जानी-पहचानी आवाज़ की नकल बन सकती है — जिसमें परेशानी में फँसा रिश्तेदार भी शामिल है।",
    },
    minutes: 3,
    explanation: {
      en: [
        "Voice cloning needs only a short sample, which is often already public in social-media videos, voice notes and status updates. The result can sound like someone you know asking for urgent money, sounding frightened, and telling you not to involve anyone else.",
        "The clue is rarely the voice; it is the shape of the request: urgent, secret, and paid through a channel the real person would not normally use. Video is not proof either — face swapping and pre-recorded sections are used together.",
        "Agree on a family code word, in advance, for emergencies. If a call claims to be from a relative in trouble, hang up and call that person back on the number you already have. A real emergency survives a two-minute delay; a fraud usually does not.",
      ],
      hi: [
        "आवाज़ की नकल के लिए थोड़ा सा नमूना काफ़ी है, जो अक्सर सोशल मीडिया वीडियो, वॉइस नोट और स्टेटस में पहले से सार्वजनिक होता है। नतीजा ऐसा लगता है कि आपका जानने वाला तुरंत पैसे माँग रहा है, डरा हुआ है, और किसी और को न बताने को कह रहा है।",
        "संकेत आवाज़ में कम, माँग के ढाँचे में ज़्यादा होता है: तुरंत, गुप्त, और ऐसे माध्यम से भुगतान जो असली व्यक्ति आमतौर पर नहीं करता। वीडियो भी प्रमाण नहीं है — चेहरा बदलना और पहले से रिकॉर्ड किए हिस्से साथ इस्तेमाल होते हैं।",
        "आपात स्थिति के लिए पहले से परिवार में एक कोड शब्द तय करें। अगर कॉल में कोई रिश्तेदार परेशानी में होने का दावा करे, तो कॉल काटें और उस व्यक्ति को उसी नंबर पर कॉल करें जो आपके पास पहले से है। असली आपात स्थिति दो मिनट रुक सकती है; ठगी आमतौर पर नहीं।",
      ],
    },
    example: {
      en: "\"Papa, I've had an accident, please don't tell Mummy. Send Rs 40,000 to this account right now, I'll explain later — my phone is broken so don't call back.\" (Voice sounds like your daughter. It is a cloned voice.)",
      hi: "\"पापा, मेरा एक्सीडेंट हो गया, मम्मी को मत बताइए। अभी इस खाते में ₹40,000 भेज दीजिए, बाद में बताऊँगी — मेरा फ़ोन टूट गया है, वापस कॉल मत करिए।\" (आवाज़ आपकी बेटी जैसी है। यह नकली आवाज़ है।)",
    },
    warningSigns: {
      en: [
        "Urgency plus secrecy: 'don't tell anyone, don't call back'.",
        "A reason is given for why you cannot reach them directly ('my phone is broken').",
        "Payment is requested by transfer to an account you do not recognise.",
        "The voice sounds right but the phrasing, vocabulary or rhythm feels slightly off.",
        "The call comes from an unknown or different number than usual.",
      ],
      hi: [
        "जल्दी और गोपनीयता साथ: 'किसी को मत बताओ, वापस कॉल मत करो'।",
        "सीधे संपर्क न कर पाने का कारण बताया जाए ('मेरा फ़ोन टूट गया')।",
        "ऐसे खाते में पैसे भेजने को कहा जाए जिसे आप नहीं पहचानते।",
        "आवाज़ सही लगे पर बोलने का ढंग, शब्द या लय थोड़ी अलग लगे।",
        "कॉल किसी अनजान या आमतौर पर इस्तेमाल न होने वाले नंबर से आए।",
      ],
    },
    saferActions: {
      en: [
        "Hang up and call the person back on the number you already have saved.",
        "Ask a question only the real person could answer, or ask them to call from their usual number.",
        "Set a family code word now, before you need it.",
        "Never let urgency override verification — that is exactly what the attack relies on.",
      ],
      hi: [
        "कॉल काटें और उस व्यक्ति को उसी सहेजे गए नंबर पर कॉल करें।",
        "ऐसा सवाल पूछें जिसका जवाब केवल असली व्यक्ति दे सकता है, या उन्हें अपने सामान्य नंबर से कॉल करने को कहें।",
        "परिवार का कोड शब्द अभी तय कर लें, ज़रूरत पड़ने से पहले।",
        "जल्दबाज़ी को सत्यापन पर हावी न होने दें — ठगी इसी पर टिकी होती है।",
      ],
    },
    quiz: [
      {
        question: {
          en: "A call in your child's voice urgently asks for money and says not to call back. What is the safest first step?",
          hi: "आपके बच्चे की आवाज़ में कॉल तुरंत पैसे माँगती है और वापस कॉल न करने को कहती है। सबसे सुरक्षित पहला कदम?",
        },
        options: [
          { en: "Send the money, then confirm later.", hi: "पैसे भेज दें, बाद में पुष्टि करें।" },
          {
            en: "Hang up and call your child on their number from your contacts.",
            hi: "कॉल काटें और अपने संपर्कों में सहेजे नंबर पर बच्चे को कॉल करें।",
          },
          { en: "Ask them to send a selfie to prove it is them.", hi: "सेल्फ़ी भेजने को कहें ताकि पुष्टि हो जाए।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "Callback verification defeats voice cloning and video fakery. A photo or video proves nothing now.",
          hi: "वापस कॉल करके पुष्टि करना नकली आवाज़ और नकली वीडियो दोनों पर काम करता है। अब फ़ोटो या वीडियो कुछ साबित नहीं करते।",
        },
      },
      {
        question: {
          en: "Why can a cloned voice sound convincingly like a relative?",
          hi: "नकली आवाज़ किसी रिश्तेदार जैसी विश्वसनीय क्यों लग सकती है?",
        },
        options: [
          { en: "The attacker recorded them inside your home.", hi: "हमलावर ने आपके घर में उनकी आवाज़ रिकॉर्ड की।" },
          {
            en: "Short public samples — voice notes, videos, statuses — are enough.",
            hi: "सार्वजनिक छोटे नमूने — वॉइस नोट, वीडियो, स्टेटस — काफ़ी होते हैं।",
          },
          { en: "They must have hacked the phone network.", hi: "उन्होंने फ़ोन नेटवर्क हैक किया होगा।" },
        ],
        correctIndex: 1,
        explanation: {
          en: "A few seconds of published audio is enough to build a usable clone, which is why callback verification matters more than listening carefully.",
          hi: "कुछ सेकंड की सार्वजनिक आवाज़ नकल बनाने के लिए काफ़ी है, इसीलिए ध्यान से सुनने से ज़्यादा ज़रूरी वापस कॉल करके पुष्टि करना है।",
        },
      },
    ],
  },
];

export const TOPIC_BY_SLUG: Record<string, LearningTopic> = Object.fromEntries(
  LEARNING_TOPICS.map((topic) => [topic.slug, topic]),
);

export function getTopic(slug: string): LearningTopic | null {
  return TOPIC_BY_SLUG[slug] ?? null;
}
