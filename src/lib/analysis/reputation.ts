import type { ReputationOutcome } from "@/lib/types";
import { serverEnv } from "@/lib/env";
import { fetchWithTimeout, readJsonBounded, TimeoutError } from "@/lib/http/fetch-timeout";
import { ENGINE_VERSION } from "./scoring";

/**
 * Optional URL reputation lookup via Google Safe Browsing v4.
 *
 * Honesty rules implemented here:
 *  - When no API key is configured we return `checked: false` and say so. We
 *    never imply a lookup happened.
 *  - When the provider errors we return `verdict: "unavailable"`, not "clean".
 *  - A successful lookup with zero matches returns `verdict: "clean"` but the
 *    note explicitly states this is not a guarantee of safety, and the UI
 *    never renders a "safe" label from it.
 *
 * SSRF note: the request goes to a fixed Google hostname. The submitted
 * address is only ever placed in the JSON body — it is never fetched.
 */

const ENDPOINT = "https://safebrowsing.googleapis.com/v4/threatMatches:find";

const THREAT_TYPES = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "UNWANTED_SOFTWARE",
  "POTENTIALLY_HARMFUL_APPLICATION",
];

type SafeBrowsingMatch = {
  threatType?: string;
  platformType?: string;
  threat?: { url?: string };
  cacheDuration?: string;
};

type SafeBrowsingResponse = {
  matches?: SafeBrowsingMatch[];
};

export function reputationConfigured(): boolean {
  return Boolean(serverEnv.safeBrowsingApiKey);
}

export function skippedReputation(note: string): ReputationOutcome {
  return {
    checked: false,
    provider: null,
    verdict: "skipped",
    threats: [],
    note,
  };
}

export async function checkUrlReputation(url: string): Promise<ReputationOutcome> {
  const key = serverEnv.safeBrowsingApiKey;
  if (!key) {
    return skippedReputation(
      "No external reputation service is configured in this deployment, so this address was not checked against any threat database.",
    );
  }

  const body = JSON.stringify({
    client: { clientId: "trusttap-ai", clientVersion: ENGINE_VERSION },
    threatInfo: {
      threatTypes: THREAT_TYPES,
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  });

  try {
    const response = await fetchWithTimeout(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      timeoutMs: Math.min(serverEnv.aiTimeoutMs, 10_000),
    });

    if (!response.ok) {
      return {
        checked: false,
        provider: "google_safe_browsing",
        verdict: "unavailable",
        threats: [],
        note: `The reputation service responded with HTTP ${response.status}, so no verdict is available. This is not a statement about the address.`,
      };
    }

    const data = await readJsonBounded<SafeBrowsingResponse>(response, 64 * 1024);
    const matches = data.matches ?? [];

    if (matches.length > 0) {
      const threats = Array.from(
        new Set(matches.map((m) => m.threatType ?? "UNKNOWN")),
      );
      return {
        checked: true,
        provider: "google_safe_browsing",
        verdict: "threat",
        threats,
        note: `Google Safe Browsing listed this address under: ${threats.join(", ")}.`,
      };
    }

    return {
      checked: true,
      provider: "google_safe_browsing",
      verdict: "clean",
      threats: [],
      note: "Google Safe Browsing had no record of this address at the time of the check. New fraud sites appear constantly, so this is not a guarantee that the address is safe.",
    };
  } catch (error) {
    const timedOut = error instanceof TimeoutError;
    return {
      checked: false,
      provider: "google_safe_browsing",
      verdict: "unavailable",
      threats: [],
      note: timedOut
        ? "The reputation service did not respond in time, so no verdict is available. This is not a statement about the address."
        : "The reputation service could not be reached, so no verdict is available. This is not a statement about the address.",
    };
  }
}
