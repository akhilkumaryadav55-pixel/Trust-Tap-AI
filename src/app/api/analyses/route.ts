import { z } from "zod";
import { jsonError, jsonOk, handleRoute } from "@/lib/http/respond";
import { checkRateLimit, clientKey } from "@/lib/http/rate-limit";
import { CONTENT_TYPES, RISK_LEVELS } from "@/lib/types";
import { deleteAllAnalyses, listAnalyses, saveAnalysis } from "@/lib/storage/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cloud-persisted saved checks.
 *
 * Requires an `Authorization: Bearer <supabase access token>` header. Without
 * Supabase configured — or without a signed-in user — these endpoints return an
 * explicit 503/401 that the UI surfaces verbatim, and the app keeps using
 * device-local storage. Nothing is ever silently "synced".
 *
 * The payload deliberately has no field for raw message text.
 */

const saveSchema = z.object({
  contentType: z.enum(CONTENT_TYPES),
  riskLevel: z.enum(RISK_LEVELS),
  riskScore: z.number().int().min(0).max(100),
  language: z.enum(["en", "hi"]),
  summary: z.string().min(1).max(1200),
  structuredFindings: z.array(z.unknown()).max(20),
  recommendedActions: z.array(z.string().max(500)).max(12),
  redactedPreview: z.string().max(400),
});

export async function GET(request: Request) {
  return handleRoute("analyses:list", async () => {
    const result = await listAnalyses(request);
    if (!result.ok) {
      return jsonError("provider_error", result.message, { status: result.status });
    }
    return jsonOk({ source: "cloud" as const, items: result.data });
  });
}

export async function POST(request: Request) {
  return handleRoute("analyses:save", async () => {
    const limit = checkRateLimit(clientKey(request), 60);
    if (!limit.allowed) {
      return jsonError("rate_limited", "Too many saves in a short time.", {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("invalid_input", "The request body was not valid JSON.", {
        status: 400,
      });
    }

    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        "invalid_input",
        parsed.error.issues[0]?.message ?? "The result could not be saved.",
        { status: 422 },
      );
    }

    const result = await saveAnalysis(request, parsed.data);
    if (!result.ok) {
      return jsonError("provider_error", result.message, { status: result.status });
    }
    return jsonOk({ source: "cloud" as const, item: result.data }, { status: 201 });
  });
}

export async function DELETE(request: Request) {
  return handleRoute("analyses:delete-all", async () => {
    const result = await deleteAllAnalyses(request);
    if (!result.ok) {
      return jsonError("provider_error", result.message, { status: result.status });
    }
    return jsonOk({ source: "cloud" as const, deleted: true });
  });
}
