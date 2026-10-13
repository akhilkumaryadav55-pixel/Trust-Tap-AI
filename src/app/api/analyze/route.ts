import { analyzeText } from "@/lib/analysis/engine";
import { jsonError, jsonOk, handleRoute } from "@/lib/http/respond";
import { checkRateLimit, clientKey } from "@/lib/http/rate-limit";
import { analyzeRequestSchema, fieldErrors, normalizeContentType } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/analyze
 *
 * Body: { text, contentType?, language?, extractedFromImage? }
 *
 * The submitted text is processed in memory and is not persisted. Any AI
 * provider call receives a redacted copy (see lib/analysis/sensitive.ts).
 */
export async function POST(request: Request) {
  return handleRoute("analyze", async () => {
    const limit = checkRateLimit(clientKey(request));
    if (!limit.allowed) {
      return jsonError(
        "rate_limited",
        `Too many checks in a short time. Please wait ${limit.retryAfter} seconds and try again.`,
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfter) },
        },
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

    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        "invalid_input",
        parsed.error.issues[0]?.message ?? "Please check your input and try again.",
        { status: 422, fields: fieldErrors(parsed.error) },
      );
    }

    const { text, contentType, language, extractedFromImage } = parsed.data;

    if (text.trim().length === 0) {
      return jsonError("invalid_input", "Please paste some content before checking.", {
        status: 422,
        fields: { text: "This field is required." },
      });
    }

    const result = await analyzeText({
      text,
      contentType: normalizeContentType(contentType),
      language,
      extractedFromImage,
    });

    return jsonOk(result);
  });
}
