/**
 * Network helpers with hard deadlines.
 *
 * Every outbound call in TrustTap AI goes through here so that no provider
 * outage can hold a request open indefinitely. Route handlers must also set
 * `export const maxDuration`, but that is a platform ceiling — these timeouts
 * are the real guarantee.
 */

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export type FetchWithTimeoutOptions = {
  timeoutMs?: number;
  /** Extra headers merged over the defaults. */
  headers?: Record<string, string>;
  /** Passed through to fetch. */
  redirect?: RequestRedirect;
};

/**
 * `fetch` with an AbortController deadline.
 *
 * `redirect: "manual"` is the default for outbound provider calls: we never
 * want a provider to bounce us to an unexpected host.
 */
export async function fetchWithTimeout(
  url: string,
  init: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
    redirect?: RequestRedirect;
  } = {},
): Promise<Response> {
  const { timeoutMs = 15_000, headers = {}, redirect = "manual", method, body } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: method ?? "GET",
      body,
      headers,
      redirect,
      signal: controller.signal,
      // Never let Next.js cache a provider response.
      cache: "no-store",
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new TimeoutError(`Request to ${safeHost(url)} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** Hostname only — used in logs and error messages so credentials never leak. */
export function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "provider";
  }
}

/** Read a JSON body but refuse to buffer an unreasonable amount of data. */
export async function readJsonBounded<T>(
  response: Response,
  maxBytes = 512 * 1024,
): Promise<T> {
  const text = await readTextBounded(response, maxBytes);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Provider returned a response that was not valid JSON");
  }
}

export async function readTextBounded(
  response: Response,
  maxBytes = 512 * 1024,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("Provider response exceeded the size limit");
      }
      chunks.push(value);
    }
  }
  return new TextDecoder().decode(concat(chunks, total));
}

function concat(chunks: Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}
