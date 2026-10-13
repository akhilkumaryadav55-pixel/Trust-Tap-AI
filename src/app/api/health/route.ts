import { getPublicCapabilities } from "@/lib/env";
import { jsonOk, handleRoute } from "@/lib/http/respond";
import { ENGINE_VERSION } from "@/lib/analysis/scoring";
import type { HealthResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Capability and readiness report.
 *
 * The UI calls this on load so it can label every result honestly: whether AI
 * interpretation ran, whether a reputation lookup is available, and whether
 * saved checks go to the cloud or stay on the device.
 */
export async function GET() {
  return handleRoute("health", async () => {
    const capabilities = getPublicCapabilities();
    const body: HealthResponse = {
      ok: true,
      mode: capabilities.mode,
      capabilities: {
        ai: capabilities.ai,
        aiVision: capabilities.aiVision,
        urlReputation: capabilities.urlReputation,
        cloudPersistence: capabilities.cloudPersistence,
      },
      version: ENGINE_VERSION,
      time: new Date().toISOString(),
    };
    return jsonOk(body);
  });
}
