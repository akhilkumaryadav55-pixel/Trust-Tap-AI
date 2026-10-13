import type { ApiError } from "@/lib/types";

/**
 * JSON response helpers.
 *
 * Two rules every route handler follows:
 *  - analysis responses are `private, no-store` (they may contain personal
 *    content and must never be cached by a proxy or CDN);
 *  - error responses never include provider payloads, stack traces or
 *    configuration details.
 */

const NO_STORE = "private, no-store, max-age=0";

export function jsonOk<T>(data: T, init?: { status?: number; headers?: Record<string, string> }) {
  return Response.json(data, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": NO_STORE,
      "X-Content-Type-Options": "nosniff",
      ...(init?.headers ?? {}),
    },
  });
}

export function jsonError(
  code: ApiError["error"]["code"],
  message: string,
  options: {
    status?: number;
    fields?: Record<string, string>;
    headers?: Record<string, string>;
  } = {},
) {
  const body: ApiError = {
    error: {
      code,
      message,
      ...(options.fields ? { fields: options.fields } : {}),
    },
  };
  return Response.json(body, {
    status: options.status ?? 400,
    headers: {
      "Cache-Control": NO_STORE,
      "X-Content-Type-Options": "nosniff",
      ...(options.headers ?? {}),
    },
  });
}

/**
 * Wrap a handler so an unexpected throw becomes a clean 500 with no internals
 * leaked. The real error is logged server-side only.
 */
export async function handleRoute(
  name: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    console.error(`[trusttap:${name}] unhandled error`, {
      message: error instanceof Error ? error.message : String(error),
    });
    return jsonError(
      "internal_error",
      "Something went wrong on our side. Please try again.",
      { status: 500 },
    );
  }
}
