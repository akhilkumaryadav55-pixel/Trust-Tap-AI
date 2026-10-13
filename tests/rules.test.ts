import { test } from "node:test";
import assert from "node:assert/strict";
import { scanRules } from "../src/lib/analysis/rules/match";

function ids(text: string): string[] {
  return scanRules(text).matches.map((m) => m.rule.id);
}

// --- True positives ---------------------------------------------------------

test("detects a classic Indian KYC phishing message", () => {
  const text =
    "Dear Customer, your KYC will expire today. Update immediately or your account will be blocked. Share OTP to verify.";
  const found = ids(text);
  assert.ok(found.includes("kyc_or_verification_update"));
  assert.ok(found.includes("account_closure_threat"));
  assert.ok(found.includes("otp_request"));
  assert.ok(found.includes("urgency_pressure"));
});

test("detects an upfront-fee job scam", () => {
  const text =
    "Congratulations! You are selected for a work from home job. Earn Rs 5000 per day. Pay a refundable registration fee of Rs 999 to confirm your position.";
  const found = ids(text);
  assert.ok(found.includes("recruitment_fee"));
  assert.ok(found.includes("too_good_to_be_true_pay"));
});

test("detects a lottery scam that demands a fee", () => {
  const text =
    "Congratulations! You won Rs 25,00,000 in KBC lucky draw. Pay Rs 5000 processing fee and send your bank details to claim your prize.";
  const found = ids(text);
  assert.ok(found.includes("prize_or_lottery"));
  assert.ok(found.includes("prize_claim_fee"));
  assert.ok(found.includes("credential_harvesting"));
});

test("detects a digital arrest / police impersonation message", () => {
  const text =
    "This is an urgent notice from CBI. A parcel in your name contains illegal narcotics. You will be arrested unless you pay a clearance charge. Do not tell your family.";
  const found = ids(text);
  assert.ok(found.includes("digital_arrest_threat"));
  assert.ok(found.includes("secrecy_pressure"));
});

test("detects a remote-access support scam", () => {
  const text =
    "Your account has an issue. Please install AnyDesk so our agent can check from your side and share your screen with us.";
  assert.ok(ids(text).includes("remote_access_request"));
});

test("detects an APK sideload instruction", () => {
  const text =
    "Download the app from this link: https://bit.ly/2xYzAb .apk and enable unknown sources to install.";
  const found = ids(text);
  assert.ok(found.includes("unknown_app_or_apk_install"));
  assert.ok(found.includes("shortened_link"));
});

test("detects a delivery-fee scam", () => {
  const text =
    "India Post: your parcel is held at our office due to incomplete address. Pay a redelivery charge of Rs 25 to release it.";
  assert.ok(ids(text).includes("delivery_fee_request"));
});

test("detects a guaranteed-returns investment pitch", () => {
  const text =
    "Join our Telegram trading group for guaranteed returns of 30% monthly. Double your money in 30 days with zero risk.";
  const found = ids(text);
  assert.ok(found.includes("guaranteed_returns"));
  assert.ok(found.includes("trading_group_invitation"));
});

test("detects an invisible-character obfuscation attempt", () => {
  const text = "Your\u200B account\u200B is suspended. Verify now.";
  assert.ok(ids(text).includes("obfuscated_characters"));
});

test("detects a Hindi-language KYC scam", () => {
  const text =
    "प्रिय ग्राहक, आपका केवाईसी आज समाप्त हो रहा है। तुरंत अपडेट करें वरना आपका खाता बंद हो जाएगा। ओटीपी बताएँ।";
  const found = ids(text);
  assert.ok(found.includes("kyc_or_verification_update"));
  assert.ok(found.includes("account_closure_threat"));
  assert.ok(found.includes("otp_request"));
});

// --- Vetoes and false-positive guards --------------------------------------

test("does NOT flag a genuine bank advisory about never sharing an OTP", () => {
  const text =
    "Security alert: our bank will never ask you for your OTP, PIN or password. Never share your OTP with anyone. Do not reply to this message.";
  const found = ids(text);
  assert.equal(found.includes("otp_request"), false);
  assert.equal(found.includes("upi_pin_request"), false);
});

test("does NOT flag a routine debit alert", () => {
  const text =
    "Your A/c XX1234 is debited by Rs.500.00 on 12-10-26. Balance is Rs.2,500.00. Thank you for banking with us.";
  assert.deepEqual(ids(text), []);
});

test("does NOT flag an 'urgent' appointment reminder with no request", () => {
  const text =
    "URGENT: Your appointment at City Hospital is confirmed for 15 Oct at 10:00 AM. Please arrive 15 minutes early.";
  assert.equal(ids(text).includes("urgency_pressure"), false);
});

test("does NOT flag a legitimate order dispatch message", () => {
  const text =
    "Your order #4821 has been dispatched and will be delivered by Friday. Track it in the app. Thanks for shopping with us.";
  assert.deepEqual(ids(text), []);
});

test("does NOT flag a message merely containing 'payment' and 'verification'", () => {
  const text =
    "Reminder: please complete your payment verification step in the vendor portal before month end.";
  const found = ids(text);
  assert.equal(found.includes("unexpected_payment_demand"), false);
});

test("marks legitimate-context dampening on weak signals", () => {
  const text =
    "Dear Customer, your statement is ready. Unsubscribe to stop receiving these messages.";
  const scan = scanRules(text);
  if (scan.matches.length > 0) {
    assert.equal(scan.legitimateContext, true);
  }
});

test("every finding carries verbatim evidence from the submission", () => {
  const text =
    "Dear Customer, share OTP 123456 to verify your account or it will be blocked today.";
  for (const match of scanRules(text).matches) {
    const cleaned = match.evidence.replace(/…/g, "").trim();
    assert.ok(
      text.includes(cleaned.slice(0, Math.min(20, cleaned.length))),
      `evidence not grounded in source: ${match.evidence}`,
    );
  }
});

test("mixed Hinglish message is detected", () => {
  const text =
    "Aapka account block ho jayega. Turant KYC update karein aur OTP share karein. Paisa bhejein registration fee.";
  const found = ids(text);
  assert.ok(found.length >= 2, `expected multiple indicators, got ${found.join(",")}`);
});
