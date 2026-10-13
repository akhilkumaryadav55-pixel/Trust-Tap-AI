/**
 * Practice samples.
 *
 * These are FICTIONAL messages written for teaching. They are always labelled
 * as samples in the UI and are never presented as real reports or statistics.
 * They contain no real phone numbers, account numbers or UPI IDs.
 */
export const PRACTICE_SAMPLES = {
  en: {
    contentType: "banking_payment" as const,
    text: "Dear Customer, your KYC will expire today. Update immediately by clicking this link or your account will be blocked. Share the OTP you receive to complete verification. Pay Rs 499 processing fee to avoid suspension. Contact 9876543210.",
  },
  hi: {
    contentType: "banking_payment" as const,
    text: "प्रिय ग्राहक, आपका केवाईसी आज समाप्त हो रहा है। तुरंत अपडेट करें वरना आपका खाता बंद कर दिया जाएगा। सत्यापन पूरा करने के लिए मिला हुआ OTP बताएँ। निलंबन से बचने के लिए ₹499 प्रोसेसिंग शुल्क भरें। संपर्क करें 9876543210।",
  },
} as const;

/** Hash used to request the sample on the message screen. */
export const SAMPLE_HASH = "#example";
