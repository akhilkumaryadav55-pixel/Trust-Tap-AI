import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";
import type { SavedAnalysisSummary, RiskLevel, ContentType } from "@/lib/types";

/**
 * Optional Supabase persistence.
 *
 * Design decisions, all privacy-motivated:
 *
 *  - **No raw content, ever.** The `analyses` table stores the category, risk
 *    level, score, structured findings and a redacted excerpt. It has no column
 *    for the submitted message or the uploaded image.
 *  - **User-scoped by RLS, not by our code.** Queries run with the *caller's*
 *    access token and the publishable anon key, so Postgres row-level security
 *    is what actually enforces ownership. A bug in our application logic cannot
 *    leak another user's rows.
 *  - **No service-role key in the request path.** The service-role key is used
 *    only by `migrations`-style tooling, never to serve a request.
 *  - **Graceful absence.** With no configuration, every function here reports
 *    "not configured" and the app uses device-local storage instead, clearly
 *    labelled in the UI.
 */

export function cloudConfigured(): boolean {
  return Boolean(serverEnv.supabaseUrl && serverEnv.supabaseAnonKey);
}

/**
 * Discriminated result types.
 *
 * Failure is its own type rather than `CloudResult<never>`: a `never` payload on
 * a success variant makes `ok` a useless discriminator and lets a failure branch
 * keep compiling after it should have been excluded.
 */
export type CloudFailure = {
  ok: false;
  status: number;
  code: "not_configured" | "unauthorized" | "upstream_error";
  message: string;
};

export type CloudResult<T> = { ok: true; data: T } | CloudFailure;

/**
 * Build a client bound to the caller's access token.
 *
 * `persistSession: false` and `autoRefreshToken: false` matter: this client is
 * created per request on the server and must never cache a session.
 */
function clientForAccessToken(accessToken: string): SupabaseClient | null {
  if (!cloudConfigured()) return null;
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;
  return token.trim() || null;
}

type AnalysesRow = {
  id: string;
  created_at: string;
  content_type: string;
  risk_level: string;
  risk_score: number;
  summary: string;
  structured_findings: unknown;
  recommended_actions: unknown;
  language: string;
  redacted_preview: string | null;
};

function rowToSummary(row: AnalysesRow): SavedAnalysisSummary {
  return {
    id: row.id,
    createdAt: row.created_at,
    contentType: row.content_type as ContentType,
    riskLevel: row.risk_level as RiskLevel,
    riskScore: row.risk_score,
    summary: row.summary,
    source: "cloud",
  };
}

const NOT_CONFIGURED: CloudFailure = {
  ok: false,
  status: 503,
  code: "not_configured",
  message:
    "Cloud storage is not configured in this deployment. Saved checks are stored on this device only.",
};

const UNAUTHORIZED: CloudFailure = {
  ok: false,
  status: 401,
  code: "unauthorized",
  message:
    "Cloud storage requires a signed-in account. Without it, checks are saved on this device only.",
};

async function requireUser(request: Request): Promise<
  { ok: true; client: SupabaseClient; userId: string } | CloudFailure
> {
  if (!cloudConfigured()) return NOT_CONFIGURED;

  const token = bearerToken(request);
  if (!token) return UNAUTHORIZED;

  const client = clientForAccessToken(token);
  if (!client) return NOT_CONFIGURED;

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return UNAUTHORIZED;

  return { ok: true, client, userId: data.user.id };
}

export async function listAnalyses(
  request: Request,
): Promise<CloudResult<SavedAnalysisSummary[]>> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth;

  const { data, error } = await auth.client
    .from("analyses")
    .select(
      "id, created_at, content_type, risk_level, risk_score, summary, structured_findings, recommended_actions, language, redacted_preview",
    )
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return {
      ok: false,
      status: 502,
      code: "upstream_error",
      message: "The cloud store could not be read.",
    };
  }
  return { ok: true, data: (data as AnalysesRow[]).map(rowToSummary) };
}

export type SaveAnalysisInput = {
  contentType: ContentType;
  riskLevel: RiskLevel;
  riskScore: number;
  language: string;
  summary: string;
  structuredFindings: unknown;
  recommendedActions: string[];
  redactedPreview: string;
};

export async function saveAnalysis(
  request: Request,
  input: SaveAnalysisInput,
): Promise<CloudResult<SavedAnalysisSummary>> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth;

  const { data, error } = await auth.client
    .from("analyses")
    .insert({
      user_id: auth.userId,
      content_type: input.contentType,
      risk_level: input.riskLevel,
      risk_score: input.riskScore,
      language: input.language,
      summary: input.summary,
      structured_findings: input.structuredFindings,
      recommended_actions: input.recommendedActions,
      redacted_preview: input.redactedPreview,
    })
    .select(
      "id, created_at, content_type, risk_level, risk_score, summary, structured_findings, recommended_actions, language, redacted_preview",
    )
    .single();

  if (error || !data) {
    return {
      ok: false,
      status: 502,
      code: "upstream_error",
      message: "The result could not be saved to the cloud store.",
    };
  }
  return { ok: true, data: rowToSummary(data as AnalysesRow) };
}

export async function deleteAnalysis(
  request: Request,
  id: string,
): Promise<CloudResult<{ id: string }>> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth;

  // `.eq("user_id", ...)` is belt-and-braces alongside RLS.
  const { error } = await auth.client
    .from("analyses")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.userId);

  if (error) {
    return {
      ok: false,
      status: 502,
      code: "upstream_error",
      message: "That entry could not be deleted from the cloud store.",
    };
  }
  return { ok: true, data: { id } };
}

export async function deleteAllAnalyses(
  request: Request,
): Promise<CloudResult<{ deleted: true }>> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth;

  const { error } = await auth.client
    .from("analyses")
    .delete()
    .eq("user_id", auth.userId);

  if (error) {
    return {
      ok: false,
      status: 502,
      code: "upstream_error",
      message: "Your cloud history could not be deleted.",
    };
  }
  return { ok: true, data: { deleted: true } };
}
