import { test } from "node:test";
import assert from "node:assert/strict";
import { analyseUrlStructure, getRegistrableDomain, parseUrl } from "../src/lib/analysis/url";

function signalIds(input: string): string[] {
  return analyseUrlStructure(input).signals.map((s) => s.id);
}

test("computes registrable domains including two-label public suffixes", () => {
  assert.equal(getRegistrableDomain("www.onlinesbi.sbi"), "onlinesbi.sbi");
  assert.equal(getRegistrableDomain("login.icicibank.com"), "icicibank.com");
  assert.equal(getRegistrableDomain("portal.cybercrime.gov.in"), "cybercrime.gov.in");
  assert.equal(getRegistrableDomain("a.b.example.co.in"), "example.co.in");
  assert.equal(getRegistrableDomain("example.com"), "example.com");
});

test("accepts a bare hostname by assuming https", () => {
  const parsed = parseUrl("example.com/login");
  assert.equal(parsed.valid, true);
  assert.equal(parsed.hostname, "example.com");
  assert.equal(parsed.protocol, "https");
});

test("rejects a non-web scheme", () => {
  const parsed = parseUrl("ftp://example.com/file");
  assert.equal(parsed.valid, false);
  assert.equal(parsed.error, "unsupported_scheme");
});

test("flags a raw IP address host", () => {
  assert.ok(signalIds("http://192.168.1.10/login").includes("ip_literal"));
});

test("flags a shortened link", () => {
  assert.ok(signalIds("https://bit.ly/3xYzAbC").includes("link_shortener"));
});

test("flags an @-based disguise", () => {
  assert.ok(
    signalIds("https://onlinesbi.sbi@evil-server.top/login").includes("userinfo_disguise"),
  );
});

test("flags a brand lookalike domain", () => {
  const ids = signalIds("https://onlinesbi-kyc-update.xyz/verify");
  assert.ok(ids.includes("brand_lookalike"));
  // The real domain must be named in the explanation so the user can compare.
  const report = analyseUrlStructure("https://onlinesbi-kyc-update.xyz/verify");
  const finding = report.signals.find((s) => s.id === "brand_lookalike");
  assert.match(finding!.detail, /onlinesbi\.sbi/);
});

test("flags a government suffix hidden inside a private domain", () => {
  const ids = signalIds("https://cybercrime.gov.in.secure-portal.xyz/complaint");
  assert.ok(ids.includes("deceptive_official_suffix"));
});

test("does not flag the official domain as a lookalike", () => {
  const ids = signalIds("https://www.cybercrime.gov.in/");
  assert.equal(ids.includes("brand_lookalike"), false);
  assert.equal(ids.includes("deceptive_official_suffix"), false);
});

test("does not flag the official bank domain as a lookalike", () => {
  const ids = signalIds("https://www.icicibank.com/personal-banking");
  assert.equal(ids.includes("brand_lookalike"), false);
});

test("rates a clean, official HTTPS address as no obvious red flags", () => {
  const report = analyseUrlStructure("https://www.cybercrime.gov.in/");
  assert.equal(report.basicRiskLevel, "no_obvious_red_flags");
  assert.equal(report.reputation.checked, false);
});

test("rates a lookalike address as elevated or high", () => {
  const report = analyseUrlStructure("http://sbi-kyc-verify.top/login/account");
  assert.ok(["high", "elevated"].includes(report.basicRiskLevel));
  assert.ok(report.basicScore >= 40);
});

test("returns unable_to_assess for unparseable input", () => {
  const report = analyseUrlStructure("not a url at all  ");
  assert.equal(report.valid, false);
  assert.equal(report.basicRiskLevel, "unable_to_assess");
});

test("never performs a network request (analysis is synchronous and offline)", () => {
  const report = analyseUrlStructure("https://example.com/");
  assert.equal(report.reputation.checked, false);
  assert.equal(report.reputation.verdict, "skipped");
});
