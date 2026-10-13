import { jsonError, jsonOk, handleRoute } from "@/lib/http/respond";
import { deleteAnalysis } from "@/lib/storage/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/analyses/:id
 *
 * Deletion is scoped to the caller by row-level security in Postgres, and
 * additionally filtered by `user_id` in the query. A user can never delete —
 * or even see — another user's saved check.
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleRoute("analyses:delete", async () => {
    const { id } = await context.params;

    if (!id || id.length > 64 || !/^[A-Za-z0-9-]+$/.test(id)) {
      return jsonError("invalid_input", "That saved check id is not valid.", {
        status: 422,
      });
    }

    const result = await deleteAnalysis(request, id);
    if (!result.ok) {
      return jsonError("provider_error", result.message, { status: result.status });
    }
    return jsonOk({ source: "cloud" as const, deleted: result.data.id });
  });
}
