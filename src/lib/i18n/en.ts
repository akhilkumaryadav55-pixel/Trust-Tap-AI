/**
 * English UI dictionary — the source of truth for the app's copy.
 *
 * `Dictionary` is derived from this object, so every other locale is
 * structurally type-checked against it. A missing or mistyped key in `hi.ts`
 * is a compile error, not a runtime "undefined" in the UI.
 *
 * Keys are grouped by the screen or concern they belong to.
 */
export const en = {
  common: {
    appName: "TrustTap AI",
    tagline: "Pause. Check. Protect.",
    checkForScams: "Check for Scams",
    analyzing: "Analyzing…",
    loading: "Loading…",
    error: "Something went wrong",
    retry: "Try again",
    cancel: "Cancel",
    save: "Save result",
    saved: "Saved",
    delete: "Delete",
    clear: "Clear",
    back: "Back",
    next: "Next",
    start: "Start",
    optional: "optional",
    learnMore: "Learn more",
    copy: "Copy",
    copied: "Copied",
    example: "Example",
    sample: "Sample",
    close: "Close",
    on: "On",
    off: "Off",
    of: "of",
    and: "and",
    question: "Question",
    yourAnswer: "Your answer",
  },
  nav: {
    dashboard: "Dashboard",
    text: "Check a message",
    screenshot: "Check a screenshot",
    url: "Check a link",
    incident: "I think I've been scammed",
    safety: "Safety Center",
    learn: "Learning Center",
    saved: "Saved checks",
    settings: "Settings",
    privacy: "Privacy",
    menu: "Menu",
    home: "Home",
  },
  onboarding: {
    title: "Check before you tap, pay or reply.",
    subtitle:
      "TrustTap AI reads a suspicious message, screenshot or link and explains — in plain language — what looks risky and what to do next.",
    point1Title: "Check suspicious messages and links",
    point1Body:
      "Paste a message, upload a screenshot or check a web address before you interact with it.",
    point2Title: "Understand the warning signs",
    point2Body:
      "See the exact words and requests that triggered a warning, and why each one matters.",
    point3Title: "Learn what to do next",
    point3Body:
      "Get clear next steps, plus official Indian helplines if you need real help.",
    getStarted: "Get Started",
    languageLabel: "Choose your language",
    privacyTitle: "Your privacy",
    privacyBody:
      "Your message is analysed on our server and is not stored by default. We never ask for passwords, OTPs, UPI PINs or card numbers. Never share those with anyone — including us.",
    demoTitle: "See how it works",
    demoBody:
      "Load a clearly-labelled practice example into the checker and see a real analysis.",
    tryDemo: "Try a practice example",
    skipToDashboard: "Skip — I know my way around",
    notAffiliated:
      "TrustTap AI is an independent awareness tool. It is not a bank, police, or government service.",
  },
  dashboard: {
    greeting: "Stay safe out there.",
    safetyMessage:
      "If a message rushes you, asks for a code, or asks you to pay to receive something — slow down and check it here first.",
    quickCheckTitle: "Quick check",
    quickCheckHint:
      "Paste the message, link or offer exactly as you received it. Do not include passwords or OTPs.",
    textareaLabel: "Suspicious content",
    textareaPlaceholder:
      "Paste the SMS, WhatsApp message, email or offer here…\n\nExample: “Dear customer, your KYC is expiring today. Update immediately or your account will be blocked.”",
    contentTypeLabel: "What kind of message is this?",
    languageLabel: "Explain in",
    recentTitle: "Recent checks",
    recentEmpty: "Nothing saved yet. Saved checks appear here.",
    recentViewAll: "View all",
    emergencyTitle: "I think I've been scammed",
    emergencyBody:
      "Lost money, shared an OTP, or gave someone remote access? Get the official steps now.",
    emergencyCta: "Get emergency steps",
    safetyCta: "Safety Center",
    learnCta: "Learning Center",
    settingsCta: "Settings & privacy",
    chooseMethod: "Choose a different check",
    statsChecks: "Checks run",
    statsHighRisk: "High-risk found",
  },
  textAnalyzer: {
    title: "Check a message",
    subtitle:
      "Paste the suspicious message exactly as you received it. We'll explain what looks risky and why.",
    textareaLabel: "Message or offer text",
    textareaPlaceholder: "Paste the full message here…",
    counterLabel: "characters",
    contentTypeLabel: "Content type",
    contentTypeAuto: "Detect automatically",
    languageLabel: "Explanation language",
    submit: "Check for Scams",
    clear: "Clear input",
    privacySummary:
      "Analysed on our server. Not stored unless you save it. Do not paste passwords, OTPs or PINs.",
    privacyAccept: "I understand and want to continue",
    emptyError: "Please paste some content before checking.",
    tooLongError: "That is too long. Please shorten it and try again.",
    sensitiveWarningTitle: "Possible sensitive information detected",
    sensitiveWarningBody:
      "Your text appears to contain a password, OTP, PIN or card number. We have not sent it for analysis. Please remove it and try again — and if you already shared it with someone, treat that account as compromised.",
    sensitiveCategoryOtp: "one-time password",
    sensitiveCategoryPin: "UPI or card PIN",
    sensitiveCategoryCard: "card number",
    sensitiveCategoryPassword: "password",
    sensitiveCategoryAadhaar: "government ID number",
    submitAnyway: "Remove the sensitive part",
    redactedNotice:
      "Sensitive values were masked before analysis and removed from your saved history.",
  },
  screenshot: {
    title: "Check a screenshot",
    subtitle:
      "Upload a screenshot of the suspicious message. Text is read out of the image, then analysed like a pasted message.",
    dropzone: "Drag a screenshot here, or choose a file",
    browse: "Choose a file",
    formats: "PNG, JPG, WEBP or HEIC. Up to 5 MB.",
    preview: "Preview",
    remove: "Remove image",
    extract: "Read text from image",
    extracting: "Reading text…",
    extractedTitle: "Extracted text — please review",
    extractedHint:
      "OCR can misread characters. Correct anything that looks wrong before analysing.",
    analyze: "Analyse this text",
    ocrUnavailableTitle: "Text reading is unavailable on this server",
    ocrEngineNoteTitle: "How text reading works",
    ocrEngineNoteBody:
      "Text is read from your screenshot by the OCR engine running on our server. If the engine cannot start or finds no readable text, you get a clear message — we never invent the contents of an image. You can always type or paste the text instead.",
    heicNoteTitle: "iPhone HEIC screenshots cannot be read here",
    heicNoteBody:
      "No vision model is configured, and the OCR engine cannot decode HEIC. Export the screenshot as PNG or JPG, or paste the text into the message checker.",
    ocrFailed: "We could not read any text from that image.",
    errorNotImage: "That file is not a supported image.",
    errorTooBig: "That image is larger than the 5 MB limit.",
    errorUnsupported: "Supported formats are PNG, JPG, WEBP and HEIC.",
    notRetained: "Uploaded images are processed in memory and not retained.",
    openTextChecker: "Open the message checker",
  },
  url: {
    title: "Check a link",
    subtitle:
      "We inspect the address itself for lookalike domains, odd subdomains, IP-address hosts and shorteners. We never open the link.",
    label: "Web address",
    placeholder: "https://example.com/login",
    check: "Check this link",
    invalidUrl: "That does not look like a valid web address.",
    emptyError: "Please enter a web address.",
    noAutoFetch:
      "TrustTap AI never visits the address you submit. Analysis is based on the address text and, when configured, a reputation lookup.",
    structureTitle: "Address structure findings",
    basicOnlyTitle: "Only a basic check was performed",
    basicOnlyBody:
      "No external reputation service is configured, so we could not check this address against a threat database. Treat the result as incomplete.",
    reputationCheckedTitle: "Reputation check completed",
    reputationUnavailableTitle: "Reputation service unavailable",
    reputationClean:
      "The reputation service had no record of this address at the time of the check. That is not a guarantee that it is safe.",
    reputationThreat: "The reputation service flagged this address as unsafe.",
    noSignals: "No structural warnings were found in the address itself.",
    scoreLabel: "Indicative address risk",
    continueToMessage:
      "Have the message that contained it? Check the full message for stronger evidence.",
  },
  results: {
    title: "Analysis result",
    resultFor: "Result",
    notFoundTitle: "No result to show",
    notFoundBody:
      "Run a check first — your latest analysis will appear here.",
    riskLevel: "Risk category",
    indicativeScore: "Indicative risk indicator score",
    scoreExplainer:
      "This is an indicative score from our checks, not a statistically established probability that fraud will occur.",
    summary: "What this looks like",
    warningSigns: "Warning signs we found",
    evidenceLabel: "Evidence",
    whyItMatters: "Why this matters",
    noFindingsTitle: "No warning signs matched our checks",
    noFindingsBody:
      "Our checks found nothing suspicious in this content. This is not proof that it is safe — some scams show no obvious signs.",
    actions: "What to do now",
    actionsToAvoid: "What not to do",
    uncertainties: "What we could not determine",
    resources: "Official help",
    save: "Save this result",
    saved: "Saved to your history",
    analyzeAnother: "Analyse another message",
    limitationsTitle: "Limits of this analysis",
    limitation1:
      "TrustTap AI cannot identify every scam. A missing warning sign is not a guarantee of safety.",
    limitation2:
      "We do not verify who sent a message, and we do not contact banks, police or any authority on your behalf.",
    limitation3:
      "We never open links you submit, and we never log in to anything on your behalf.",
    confidenceLabel: "How confident we are",
    checkedOn: "Checked on",
    findingsCount: "indicators found",
    sourceRule: "Rule check",
    sourceAi: "AI interpretation",
    sourceStructure: "Address structure",
    sourceReputation: "Reputation service",
    notCounted: "Not counted — the quote could not be verified",
    truncatedNote: "Shortened",
    rulesLabel: "Rule checks",
    confidenceHigh: "Multiple strong, specific indicators were found.",
    confidenceMedium: "Several indicators were found, but some context is missing.",
    confidenceLow: "Very little specific evidence was found. Treat this carefully.",
    engineAssisted: "AI interpretation: used",
    engineRulesOnly: "AI interpretation: not configured — rule engine only",
    engineAiFailed:
      "AI interpretation: configured but unavailable, so results come from the rule engine only",
    reputationRan: "External reputation check: completed",
    reputationSkipped: "External reputation check: not performed",
    disclaimer:
      "TrustTap AI is an awareness and education tool. It is not a bank, police or government application and does not replace professional investigation.",
    aiNotice:
      "AI can make mistakes. Read the evidence for each warning sign and use your own judgment.",
    risk: {
      high: {
        label: "High Risk",
        description: "Strong suspicious indicators are present.",
      },
      elevated: {
        label: "Elevated Risk",
        description: "Multiple concerning indicators are present.",
      },
      caution: {
        label: "Caution",
        description:
          "Some potentially concerning indicators are present, but the evidence is incomplete.",
      },
      no_obvious_red_flags: {
        label: "No Obvious Red Flags Found",
        description:
          "The content does not show the major indicators detected by our available checks. This is not a statement that it is safe.",
      },
      unable_to_assess: {
        label: "Unable to Assess",
        description:
          "There was not enough usable content, or an essential service failed, so we cannot give a reliable risk category.",
      },
    },
  },
  incident: {
    title: "I think I've been scammed",
    subtitle:
      "Answer one question and we will show the right steps for your situation. Speed matters most in the first hours.",
    intro:
      "This tool does not contact your bank, police or any authority. It shows you what to do yourself, and where to get official help.",
    question: "What happened?",
    chooseAgain: "Choose a different situation",
    yourSteps: "Your next steps",
    doFirst: "Do this first",
    within24: "Within the first 24 hours",
    preserveEvidence: "Keep the evidence",
    officialHelp: "Official help",
    callHelpline: "Call 1930",
    openPortal: "Open cybercrime.gov.in",
    openSanchar: "Open Sanchar Saathi",
    helplineNote:
      "1930 is the Indian national cybercrime financial-fraud helpline. If you are outside India, contact your local police and bank.",
    bankNote:
      "Contact your bank or payment provider immediately using the phone number or app you already trust — never a number given to you in the suspicious message.",
    preserveNote:
      "Keep the message, screenshots, transaction reference numbers, times and any account numbers involved. Do not delete them, and do not send them to strangers offering to 'recover' your money.",
    noGuarantee:
      "Reporting quickly improves your chances, but no one can guarantee that money will be recovered. Never pay anyone who promises to recover it for a fee.",
    nothingHappened:
      "If nothing was lost or shared, you can still report the message and block the sender.",
    reportMessage: "Report the message to Sanchar Saathi",
    recoveryFraudWarning:
      "Beware 'recovery agents' who ask for an upfront fee. That is a second scam.",
    options: {
      clicked_link: {
        label: "I clicked a suspicious link",
        description: "You opened a link but have not entered anything yet.",
      },
      shared_personal_info: {
        label: "I shared personal information",
        description: "Name, address, ID number, photos or documents.",
      },
      shared_otp: {
        label: "I shared an OTP or password",
        description: "You gave someone a one-time code or your login details.",
      },
      approved_payment: {
        label: "I approved a payment or sent money",
        description: "Money left your account via UPI, card, transfer or wallet.",
      },
      installed_app: {
        label: "I installed an unfamiliar application",
        description: "You installed an APK or app you did not intend to install.",
      },
      shared_screen: {
        label: "I shared screen or remote access",
        description: "You let someone view or control your device.",
      },
      threat_call: {
        label: "I got a threatening or impersonation call",
        description: "Someone posed as police, a bank, or a government officer.",
      },
      something_else: {
        label: "Something else happened",
        description: "A different kind of suspicious online contact.",
      },
    },
  },
  safety: {
    title: "India Safety Center",
    subtitle:
      "Official helplines and portals for suspected online fraud and suspicious communications.",
    whenTitle: "Which service should you use?",
    whenFinancialTitle: "Money or financial details involved",
    whenFinancialBody:
      "Use the national cybercrime financial-fraud helpline and portal. Report as early as you can, then contact your bank.",
    whenCommsTitle: "Suspicious message, call or number",
    whenCommsBody:
      "Report the communication to the telecom cyber-safety portal. You do not need to have lost money.",
    helplineTitle: "Cybercrime helpline",
    helplineNumber: "1930",
    helplineBody:
      "Free national helpline for financial cyber fraud in India. Also reachable via 112 in some regions.",
    portalTitle: "National Cyber Crime Reporting Portal",
    portalBody:
      "Official Government of India portal for filing cybercrime complaints online.",
    sancharTitle: "Sanchar Saathi",
    sancharBody:
      "Department of Telecommunications portal to report suspected fraud calls, messages and to check connections in your name.",
    bankTitle: "Contact your bank or payment provider",
    bankStep1:
      "Call the number printed on your card, passbook or official bank app — never a number from the suspicious message.",
    bankStep2:
      "Ask them to freeze or block the transaction, the card, or your UPI access.",
    bankStep3:
      "Ask for a written acknowledgement and a complaint reference number.",
    bankStep4:
      "If a UPI transaction is pending in a request, decline it in your app.",
    evidenceTitle: "Preserve your evidence",
    evidenceStep1: "Screenshot the message, the sender's number and the profile.",
    evidenceStep2:
      "Note the date, time and amount (with currency) and the transaction reference.",
    evidenceStep3:
      "Save any email headers or the full sender address where possible.",
    evidenceStep4:
      "Keep everything. Do not delete the thread, even if it upsets you.",
    passwordTitle: "Secure your accounts",
    passwordStep1:
      "Change the password on any account you shared, from a device you trust.",
    passwordStep2: "Turn on two-factor authentication everywhere it is offered.",
    passwordStep3:
      "Never reuse the same password across banking, email and social accounts.",
    passwordStep4:
      "Sign out other sessions, and review recent logins and app permissions.",
    officialNotice:
      "These links open official Government of India services. TrustTap AI is an independent tool and is not owned, operated, endorsed by or affiliated with any government body, bank or telecom operator.",
    disclaimer:
      "Information here is general guidance, not legal advice. Verify helpline numbers and portal addresses independently before acting.",
    lastVerified: "Official links last reviewed",
  },
  learn: {
    title: "Learning Center",
    subtitle:
      "Short, practical lessons on the scams people in India are most likely to meet. Each lesson has an example, warning signs, safer actions and a quiz.",
    topicsLabel: "topics",
    exampleTitle: "Educational example",
    exampleNotice:
      "This is a fictional example written for teaching. It is not a real message or a verified case report.",
    warningSignsTitle: "Common warning signs",
    saferActionsTitle: "Safer alternatives",
    quizTitle: "Quick quiz",
    quizIntro: "Test what you just read. There is no score saved.",
    quizSubmit: "Check answer",
    quizCorrect: "Correct — that is the safer choice.",
    quizIncorrect: "Not quite. The safer choice is highlighted.",
    quizScoreLabel: "Correct",
    quizAgain: "Reset quiz",
    quizComplete: "Quiz complete",
    backToTopics: "All topics",
    readLesson: "Read lesson",
    minutes: "min read",
  },
  saved: {
    title: "Saved checks",
    subtitle:
      "Saved results live on this device unless cloud storage is configured. Raw message text is never saved by default.",
    empty: "No saved checks yet",
    emptyBody:
      "When you save an analysis it appears here so you can revisit the advice later.",
    delete: "Delete",
    deleteAll: "Delete all saved checks",
    confirmDeleteAll: "Delete all saved checks? This cannot be undone.",
    deleted: "Deleted",
    openResult: "Open result",
    count: "saved",
    localModeNotice:
      "Local device mode — these entries exist only in this browser and are not uploaded anywhere. Clearing browser data removes them.",
    cloudModeNotice:
      "Cloud mode — saved entries are stored in your own Supabase account with row-level security.",
    historyDisabledTitle: "History is turned off",
    historyDisabledBody:
      "Saving new checks is disabled in Settings. Existing entries remain until you delete them.",
    enableHistory: "Turn history on in Settings",
    rawNotStored:
      "What we keep: the category, risk result and a redacted excerpt. Raw text and images are not stored.",
    sourceLocal: "Device",
    sourceCloud: "Cloud",
  },
  settings: {
    title: "Settings & privacy",
    subtitle: "Control language, appearance, history and your stored data.",
    language: "Language",
    languageHint: "Applies to the interface and to new explanations.",
    theme: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "Match system",
    history: "Save my check history",
    historyOnHint:
      "Saved checks are metadata only: category, risk result and a redacted excerpt.",
    historyOffHint:
      "Nothing new will be saved. Checks still work normally.",
    dataTitle: "Your data",
    deleteLocalHistory: "Delete saved checks on this device",
    exportData: "Download my saved checks (JSON)",
    exportDone: "Download prepared",
    deleteCloudData: "Delete my cloud data",
    deleteCloudUnavailable:
      "Cloud persistence is not configured in this deployment, so there is no cloud data to delete.",
    privacyTitle: "Privacy notice",
    privacyBody:
      "We do not store the messages or images you submit unless you explicitly save a result. Saved results keep the category, risk level and a redacted excerpt only. We never ask for, or want, your passwords, OTPs, UPI PINs or full card numbers.",
    aiLimitationsTitle: "AI limitations",
    aiLimitationsBody:
      "Automated checks can be wrong in both directions. They may miss a real scam or raise a false alarm on a legitimate message. Treat every result as a prompt to think, not as a verdict. TrustTap AI never contacts your bank, police or any authority on your behalf.",
    engineTitle: "Current engine status",
    engineMode: "Analysis mode",
    modeAssisted: "AI-assisted (rule engine + AI interpretation)",
    modeRulesOnly: "Rule engine only (no AI provider configured)",
    capAi: "AI interpretation",
    capVision: "AI screenshot reading",
    capReputation: "External URL reputation",
    capCloud: "Cloud storage",
    notConfigured: "Not configured",
    configured: "Configured",
    contactTitle: "Feedback and contact",
    contactBody:
      "Found a bug, a wrong classification, or a scam we should teach? Tell us — the safest tool is one that keeps learning.",
    contactCta: "Send feedback by email",
    aboutTitle: "About TrustTap AI",
    versionLabel: "Version",
    resetOnboarding: "Show the welcome screen again",
    resetOnboardingDone: "Welcome screen will show next time you open the app.",
    dangerZone: "Danger zone",
  },
  privacy: {
    title: "Privacy notice",
    subtitle: "Plain-language summary of what happens to what you submit.",
    whatWeCollect: "What we process",
    whatWeCollectBody:
      "The message text, link or screenshot you choose to submit, plus the content type and language you select.",
    whyBody:
      "Only to produce your analysis result and show it to you. Nothing else.",
    whereBody:
      "Analysis runs on our server. If an AI provider is configured, a minimised copy of the content is sent to that provider for interpretation. If an external URL reputation service is configured, only the address is sent.",
    retentionBody:
      "By default we do not store the content you submit. If you save a result, we keep the category, risk level, score, findings and a redacted excerpt — never the full message or the image.",
    rightsBody:
      "You can delete saved checks individually, delete everything at once, or disable saving entirely, from Settings.",
    neverBody:
      "We will never ask you for a password, OTP, UPI PIN, CVV or full card number. Anyone who does is attempting fraud.",
    contactBody: "Privacy questions can be sent to the contact address in Settings.",
  },
  status: {
    rulesOnlyBadge: "Rule engine mode",
    assistedBadge: "AI-assisted mode",
    cloudOn: "Cloud storage configured",
    cloudOff: "Device-only storage",
    reputationOff: "Reputation lookup unavailable",
    offlineTitle: "You appear to be offline",
    offlineBody:
      "Analysis needs a connection. Your saved checks are still available. Reconnect and try again.",
    apiDownTitle: "Analysis service unreachable",
    apiDownBody:
      "We could not reach the analysis service. Your input was not sent. Please try again in a moment.",
    timeoutTitle: "Analysis took too long",
    timeoutBody:
      "The analysis did not finish in time. Try again, or paste a shorter excerpt.",
  },
};

/**
 * Structural type every locale must implement.
 *
 * Deliberately NOT `as const`: literal types would force every translation to
 * be byte-identical to English. Widening to `string` keeps the *shape*
 * enforced while letting each locale translate freely.
 */
export type Dictionary = typeof en;
