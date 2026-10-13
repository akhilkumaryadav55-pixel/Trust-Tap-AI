import { test } from "node:test";
import assert from "node:assert/strict";
import { detectAndRedact, luhnValid } from "../src/lib/analysis/sensitive";

test("luhnValid accepts real card numbers and rejects arbitrary digits", () => {
  assert.equal(luhnValid("4111111111111111"), true);
  assert.equal(luhnValid("4111111111111112"), false);
  assert.equal(luhnValid("1234567890123456"), false);
});

test("redacts a card number and keeps only the last four digits", () => {
  const report = detectAndRedact(
    "Please confirm card 4111 1111 1111 1111 for the refund.",
  );
  assert.equal(report.detected, true);
  assert.deepEqual(report.categories, ["card"]);
  assert.ok(!report.redacted.includes("4111 1111 1111 1111"));
  assert.ok(report.redacted.includes("[redacted]"));
  assert.ok(report.hits[0].masked[0].endsWith("1111"));
});

test("does not treat a random 16-digit number as a card", () => {
  const report = detectAndRedact("Order 1234567890123456 was shipped today.");
  assert.equal(report.categories.includes("card"), false);
});

test("redacts an OTP that is described as an OTP", () => {
  const report = detectAndRedact("Your OTP is 483920 for the transaction.");
  assert.ok(report.categories.includes("otp"));
  assert.ok(!report.redacted.includes("483920"));
});

test("does not redact a plain number that is not a code", () => {
  const report = detectAndRedact("Your ticket number is 483920.");
  assert.equal(report.detected, false);
});

test("redacts a UPI PIN", () => {
  const report = detectAndRedact("Enter your UPI PIN 1234 to receive money.");
  assert.ok(report.categories.includes("pin"));
  assert.ok(!report.redacted.includes("1234 "));
});

test("redacts password values but not the word password on its own", () => {
  const withValue = detectAndRedact("Your password is hunter2change");
  assert.ok(withValue.categories.includes("password"));

  const withoutValue = detectAndRedact(
    "Never share your password with anyone. Password reset is available.",
  );
  assert.equal(withoutValue.detected, false);
});

test("detects an Aadhaar-format number", () => {
  const report = detectAndRedact("Aadhaar 3456 7890 1234 was used.");
  assert.ok(report.categories.includes("government_id"));
});

test("returns the original text untouched when nothing sensitive is present", () => {
  const input = "Your parcel is out for delivery today.";
  const report = detectAndRedact(input);
  assert.equal(report.detected, false);
  assert.equal(report.redacted, input);
});
