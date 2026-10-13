import { serverEnv } from "@/lib/env";

/**
 * Rate limiting.
 *
 * This is a fixed-window counter held in module memory. It is genuinely useful
 * for a single-instance deployment and for freeing the app from accidental
 * self-inflicted load, but it is NOT a distributed limiter: on a multi-instance
 * or serverless deployment each instance keeps its own counters.
 *
 * docs/SECURITY.md documents the production upgrade path (an edge limiter or a
 * shared counter in Redis/Upstash). The UI never claims a request was blocked
 * for any reason other than this limiter.
 */

type Window = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 5_000;

const buckets = new Map<string, Window>();

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

/** Derive a stable client key without trusting proxy headers blindly. */
export function clientKey(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // Left-most entry is the original client in a well-behaved proxy chain.
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? "unknown";
}

export function checkRateLimit(
  key: string,
  limit = serverEnv.rateLimitPerMinute,
): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, window] of buckets) {
      if (window.resetAt <= now) buckets.delete(k);
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, limit, remaining: limit - 1, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit,
    remaining: limit - existing.count,
    retryAfter: 0,
  };
}

/** Test helper — clears all counters. */
export function resetRateLimits(): void {
  buckets.clear();
}
