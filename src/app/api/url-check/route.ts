import { analyzeUrl } from "@/lib/analysis/engine";
import { jsonError, jsonOk, handleRoute } from "@/lib/http/respond";
import { checkRateLimit, clientKey } from "@/lib/http/rate-limit";
import { fieldErrors, urlRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * POST /api/url-check
 *
 * Body: { url, language? }
 *
 * SECURITY: the submitted address is never fetched. Parsing is purely textual
 * (see lib/analysis/url.ts) and the only optional network call goes to a fixed
 * reputation provider hostname.
 */
export async function POST(request: Request) {
  return handleRoute("url-check", async () => {
    const limit = checkRateLimit(clientKey(request));
    if (!limit.allowed) {
      return jsonError(
        "rate_limited",
        `Too many checks in a short time. Please wait ${limit.retryAfter} seconds and try again.`,
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("invalid_input", "The request body was not valid JSON.", {
        status: 400,
      });
    }

    const parsed = urlRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        "invalid_input",
        parsed.error.issues[0]?.message ?? "Please enter a valid web address.",
        { status: 422, fields: fieldErrors(parsed.error) },
      );
    }

    const result = await analyzeUrl({
      url: parsed.data.url,
      language: parsed.data.language,
    });

    return jsonOk(result);
  });
}
