import type { RiskLevel, Severity, UrlReport, UrlSignal } from "@/lib/types";
import { shortenerHosts } from "./url-lists";

/**
 * URL structure analysis — completely offline.
 *
 * SECURITY: this module never performs a network request against a submitted
 * address. Doing so would create a server-side request forgery (SSRF) surface:
 * an attacker could submit `http://169.254.169.254/` or `http://10.0.0.1/admin`
 * and make our server probe its own network. It would also confirm to the
 * attacker that a link was clicked. Analysis is therefore strictly textual.
 *
 * The only optional network call in the whole URL path is the reputation
 * lookup in `reputation.ts`, which talks exclusively to a fixed, allowlisted
 * provider hostname and never to the submitted address.
 */

/** Common two-label public suffixes. A full PSL is not needed for structure checks. */
const MULTI_LABEL_SUFFIXES = new Set([
  "co.in",
  "org.in",
  "net.in",
  "gen.in",
  "firm.in",
  "ind.in",
  "ac.in",
  "edu.in",
  "gov.in",
  "nic.in",
  "res.in",
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "com.au",
  "net.au",
  "org.au",
  "gov.au",
  "co.jp",
  "or.jp",
  "com.br",
  "com.cn",
  "co.za",
  "com.sg",
  "co.nz",
]);

const RISKY_TLDS = new Set([
  "xyz",
  "top",
  "online",
  "site",
  "shop",
  "club",
  "buzz",
  "icu",
  "vip",
  "win",
  "bid",
  "loan",
  "work",
  "click",
  "link",
  "live",
  "cf",
  "gq",
  "ml",
  "tk",
  "zip",
  "mov",
  "country",
  "stream",
  "download",
  "racing",
  "review",
  "kim",
  "men",
  "date",
  "party",
  "gdn",
  "quest",
  "rest",
  "monster",
  "sbs",
  "cyou",
  "bar",
  "casa",
  "today",
  "life",
  "world",
  "email",
  "surf",
  "beauty",
]);

/**
 * Popular brands operating in India mapped to their real registrable domain.
 * Used only for *lookalike* detection: if the brand word appears in the
 * address but the registrable domain is different, the address is claiming to
 * be something it is not.
 */
const BRAND_DOMAINS: Record<string, string> = {
  sbi: "onlinesbi.sbi",
  onlinesbi: "onlinesbi.sbi",
  hdfc: "hdfcbank.com",
  hdfcbank: "hdfcbank.com",
  icici: "icicibank.com",
  icicibank: "icicibank.com",
  axisbank: "axisbank.com",
  kotak: "kotak.com",
  pnb: "pnbindia.in",
  bob: "bankofbaroda.in",
  canarabank: "canarabank.com",
  paytm: "paytm.com",
  phonepe: "phonepe.com",
  gpay: "pay.google.com",
  googlepay: "pay.google.com",
  upi: "npci.org.in",
  bhim: "npci.org.in",
  amazon: "amazon.in",
  flipkart: "flipkart.com",
  myntra: "myntra.com",
  ajio: "ajio.com",
  meesho: "meesho.com",
  snapdeal: "snapdeal.com",
  netflix: "netflix.com",
  airtel: "airtel.in",
  jio: "jio.com",
  vodafone: "myvi.in",
  vi: "myvi.in",
  bsnl: "bsnl.co.in",
  irctc: "irctc.co.in",
  irctcindia: "irctc.co.in",
  epfo: "epfindia.gov.in",
  uidai: "uidai.gov.in",
  aadhaar: "uidai.gov.in",
  incometax: "incometax.gov.in",
  incometaxindia: "incometax.gov.in",
  gst: "gst.gov.in",
  npci: "npci.org.in",
  rbi: "rbi.org.in",
  sebi: "sebi.gov.in",
  cybercrime: "cybercrime.gov.in",
  sancharsaathi: "sancharsaathi.gov.in",
  trai: "trai.gov.in",
  passport: "passportindia.gov.in",
  nps: "npscra.nsdl.co.in",
  swiggy: "swiggy.com",
  zomato: "zomato.com",
  blinkit: "blinkit.com",
  zepto: "zepto.com",
  bigbasket: "bigbasket.com",
  statebank: "onlinesbi.sbi",
  netflixindia: "netflix.com",
  whatsapp: "whatsapp.com",
  instagram: "instagram.com",
  facebook: "facebook.com",
  telegram: "telegram.org",
};

/** Words that appear in phishing paths far more often than in real ones. */
const PHISHING_PATH_WORDS =
  /(?:verify|verification|login|signin|sign-in|secure|update|kyc|account|banking|netbanking|otp|wallet|refund|reward|claim|unlock|suspend|blocked|recover|support|billing|invoice|payment|upi|aadhaar|pan|e-?kyc|registration)/gi;

export type ParsedUrl = {
  valid: boolean;
  normalized: string;
  protocol: string | null;
  hostname: string | null;
  port: string | null;
  pathname: string | null;
  registrableDomain: string | null;
  tld: string | null;
  subdomainLabels: string[];
  hasUserInfo: boolean;
  error: string | null;
};

function isIpLiteral(host: string): boolean {
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true;
  if (host.startsWith("[") && host.includes("]")) return true; // IPv6
  return false;
}

/** Approximate the registrable domain ("example.co.in", "example.com"). */
export function getRegistrableDomain(hostname: string): string | null {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (!host || isIpLiteral(host)) return null;
  const labels = host.split(".").filter(Boolean);
  if (labels.length < 2) return null;
  const lastTwo = labels.slice(-2).join(".");
  if (labels.length >= 3 && MULTI_LABEL_SUFFIXES.has(lastTwo)) {
    return labels.slice(-3).join(".");
  }
  return lastTwo;
}

/**
 * Parse a user-supplied address without performing any network activity.
 *
 * A bare hostname like "example.com/login" is accepted and assumed to be
 * https, because that is how people paste links out of messages.
 */
export function parseUrl(input: string): ParsedUrl {
  const raw = input.trim();
  if (!raw) {
    return {
      valid: false,
      normalized: "",
      protocol: null,
      hostname: null,
      port: null,
      pathname: null,
      registrableDomain: null,
      tld: null,
      subdomainLabels: [],
      hasUserInfo: false,
      error: "empty",
    };
  }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      valid: false,
      normalized: raw,
      protocol: null,
      hostname: null,
      port: null,
      pathname: null,
      registrableDomain: null,
      tld: null,
      subdomainLabels: [],
      hasUserInfo: false,
      error: "unparseable",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      normalized: raw,
      protocol: parsed.protocol.replace(":", ""),
      hostname: null,
      port: null,
      pathname: null,
      registrableDomain: null,
      tld: null,
      subdomainLabels: [],
      hasUserInfo: false,
      error: "unsupported_scheme",
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname.includes(".") && !isIpLiteral(hostname)) {
    return {
      valid: false,
      normalized: raw,
      protocol: parsed.protocol.replace(":", ""),
      hostname,
      port: parsed.port || null,
      pathname: parsed.pathname,
      registrableDomain: null,
      tld: null,
      subdomainLabels: [],
      hasUserInfo: Boolean(parsed.username),
      error: "no_tld",
    };
  }

  const registrableDomain = getRegistrableDomain(hostname);
  const subdomainLabels = registrableDomain
    ? hostname.split(".").slice(0, -registrableDomain.split(".").length)
    : [];
  const tld = hostname.split(".").pop() ?? null;

  return {
    valid: true,
    normalized: parsed.toString(),
    protocol: parsed.protocol.replace(":", ""),
    hostname,
    port: parsed.port || null,
    pathname: parsed.pathname,
    registrableDomain,
    tld,
    subdomainLabels,
    hasUserInfo: Boolean(parsed.username || parsed.password),
    error: null,
  };
}

function signal(
  id: string,
  label: string,
  detail: string,
  severity: Severity,
  weight: number,
): UrlSignal {
  return { id, label, detail, severity, weight };
}

/**
 * Produce the structural findings for an address.
 * Every signal names a concrete, observable property of the address text.
 */
export function analyseUrlStructure(input: string): UrlReport {
  const parsed = parseUrl(input);

  if (!parsed.valid || !parsed.hostname) {
    return {
      input,
      normalized: parsed.normalized,
      valid: false,
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      registrableDomain: null,
      tld: parsed.tld,
      isIpLiteral: false,
      isShortener: false,
      signals: [],
      basicScore: 0,
      basicRiskLevel: "unable_to_assess",
      reputation: {
        checked: false,
        provider: null,
        verdict: "skipped",
        threats: [],
        note: "The address could not be parsed, so no reputation lookup was attempted.",
      },
    };
  }

  const {
    hostname,
    registrableDomain,
    tld,
    subdomainLabels,
    hasUserInfo,
    pathname,
    port,
    protocol,
  } = parsed;
  const full = parsed.normalized.toLowerCase();
  const signals: UrlSignal[] = [];

  const ipLiteral = isIpLiteral(hostname);
  const isShortener = shortenerHosts.has(hostname);

  if (ipLiteral) {
    signals.push(
      signal(
        "ip_literal",
        "The address is a raw IP number, not a domain name",
        `"${hostname}" is an IP address. Real banks and companies use named domains; raw IPs are typical of temporary servers set up for an attack.`,
        "high",
        24,
      ),
    );
  }

  if (isShortener) {
    signals.push(
      signal(
        "link_shortener",
        "The link is shortened, hiding its real destination",
        `"${hostname}" is a link-shortening service. The address you see is not the address you reach.`,
        "medium",
        16,
      ),
    );
  }

  if (hasUserInfo) {
    signals.push(
      signal(
        "userinfo_disguise",
        "The address contains an “@” sign used to disguise the real site",
        "Everything before “@” is ignored by browsers, so the visible part can be a well-known name while the real destination is completely different.",
        "high",
        22,
      ),
    );
  }

  if (subdomainLabels.length >= 3) {
    signals.push(
      signal(
        "excessive_subdomains",
        "Unusually many subdomains",
        `"${hostname}" has ${subdomainLabels.length} subdomain levels. Attackers stack subdomains to bury the real domain at the end of a long address.`,
        "medium",
        14,
      ),
    );
  }

  if (hostname.startsWith("xn--") || hostname.includes(".xn--")) {
    signals.push(
      signal(
        "punycode_hostname",
        "The domain uses an encoded international script",
        "Punycode (xn--) is legitimate for non-Latin scripts, but it is also how lookalike domains are made. Read this address character by character.",
        "medium",
        14,
      ),
    );
  }

  if (registrableDomain && tld && RISKY_TLDS.has(tld)) {
    signals.push(
      signal(
        "risky_tld",
        `The “.${tld}” extension is frequently used by short-lived fraud sites`,
        "This extension is cheap or free to register, which makes it popular for throwaway phishing sites. It is not proof of fraud on its own.",
        "medium",
        10,
      ),
    );
  }

  if (protocol === "http") {
    signals.push(
      signal(
        "no_https",
        "The link is not secured with HTTPS",
        "Data sent over http:// travels unencrypted. No bank, payment app or government portal serves login pages over plain http.",
        "medium",
        14,
      ),
    );
  }

  if (port && !["80", "443", ""].includes(port)) {
    signals.push(
      signal(
        "non_standard_port",
        `The link uses an unusual port (${port})`,
        "Non-standard ports are common on hastily configured or temporary servers.",
        "low",
        8,
      ),
    );
  }

  if (/(?:^|[.-])\d{4,}(?:[.-]|$)/.test(registrableDomain ?? "")) {
    signals.push(
      signal(
        "numeric_brand_domain",
        "The domain name contains a long number",
        "Adding numbers to a brand name is a standard way to register a lookalike domain.",
        "low",
        8,
      ),
    );
  }

  if ((registrableDomain?.split(".")[0].match(/-/g) ?? []).length >= 2) {
    signals.push(
      signal(
        "many_hyphens",
        "The domain name contains several hyphens",
        "Hyphen-stuffed domains such as “sbi-kyc-update” are built to read like a sentence while not being the real site.",
        "medium",
        12,
      ),
    );
  }

  // --- Lookalike brand detection -------------------------------------------
  const hostWithoutTld = hostname.replace(/\.$/, "").toLowerCase();
  const matchedBrands = Object.keys(BRAND_DOMAINS).filter((brand) =>
    // Word-boundary match so "sbi" does not fire inside "transbit".
    new RegExp(`(?:^|[^a-z])${brand}(?:[^a-z]|$)`).test(hostWithoutTld),
  );

  if (matchedBrands.length > 0) {
    const officialDomains = matchedBrands.map((b) => BRAND_DOMAINS[b]);
    const isOfficial = officialDomains.some(
      (official) =>
        registrableDomain === official ||
        hostname === official ||
        hostname.endsWith(`.${official}`),
    );
    if (!isOfficial) {
      signals.push(
        signal(
          "brand_lookalike",
          "A well-known brand name appears in the address, but the domain is not the brand's",
          `The address mentions ${matchedBrands
            .map((b) => `“${b}”`)
            .join(", ")} but is registered under “${registrableDomain}”. The real domain is “${officialDomains[0]}”.`,
          "high",
          26,
        ),
      );
    }
  }

  // --- Deceptive official-looking suffix ----------------------------------
  const deceptiveSuffixes = [".gov.in", ".nic.in", ".gov", ".ac.in", ".org.in"];
  if (
    deceptiveSuffixes.some((suffix) => hostname.includes(suffix.slice(1))) &&
    registrableDomain &&
    !deceptiveSuffixes.some((suffix) => registrableDomain.endsWith(suffix.slice(1)))
  ) {
    signals.push(
      signal(
        "deceptive_official_suffix",
        "The address imitates an official suffix inside a non-official domain",
        `The address contains an official-looking segment but is actually registered under “${registrableDomain}”. Government bodies use their own domains, never a subdomain of someone else's.`,
        "high",
        26,
      ),
    );
  }

  // --- Path vocabulary -----------------------------------------------------
  const pathWords = Array.from(
    new Set((`${pathname ?? ""}${full.includes("?") ? full.slice(full.indexOf("?")) : ""}`).match(PHISHING_PATH_WORDS) ?? []),
  );
  if (pathWords.length >= 2) {
    signals.push(
      signal(
        "phishing_path_vocabulary",
        "The address path reads like an account-security page",
        `Words used: ${pathWords.slice(0, 6).join(", ")}. These appear far more often in phishing links than in genuine ones, though many real pages use them too.`,
        "low",
        8,
      ),
    );
  }

  if (hostname.length > 40) {
    signals.push(
      signal(
        "very_long_hostname",
        "The domain name is unusually long",
        `The host is ${hostname.length} characters. Very long domains are hard to read and are used to hide the real domain.`,
        "low",
        8,
      ),
    );
  }

  const basicScore = Math.min(
    100,
    signals.reduce((sum, s) => sum + s.weight, 0),
  );

  // URL-only checks are deliberately cautious: without a reputation verdict we
  // never claim an address is clean.
  const hasHigh = signals.some((s) => s.severity === "high");
  let basicRiskLevel: RiskLevel;
  if (basicScore >= 45 || hasHigh) {
    basicRiskLevel = basicScore >= 65 ? "high" : "elevated";
  } else if (basicScore >= 14) {
    basicRiskLevel = "caution";
  } else {
    basicRiskLevel = "no_obvious_red_flags";
  }

  return {
    input,
    normalized: parsed.normalized,
    valid: true,
    protocol,
    hostname,
    registrableDomain,
    tld,
    isIpLiteral: ipLiteral,
    isShortener,
    signals,
    basicScore,
    basicRiskLevel,
    reputation: {
      checked: false,
      provider: null,
      verdict: "skipped",
      threats: [],
      note: "No reputation lookup was performed.",
    },
  };
}
