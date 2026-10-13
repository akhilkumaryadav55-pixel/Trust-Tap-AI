import { serverEnv } from "@/lib/env";
import { fetchWithTimeout, readJsonBounded, TimeoutError } from "@/lib/http/fetch-timeout";

/**
 * Provider interface for AI interpretation.
 *
 * Deliberately provider-agnostic: it speaks the OpenAI `/chat/completions`
 * wire format, which is implemented by OpenAI, Azure OpenAI, Groq, Together,
 * OpenRouter, Ollama, vLLM and gateway products such as OpenLLM. Swapping
 * providers is an environment-variable change, not a code change.
 *
 * Every failure mode is typed so the caller can tell the user exactly what
 * happened instead of silently degrading to "looks fine".
 */

export type AiFailureKind =
  | "not_configured"
  | "timeout"
  | "http_error"
  | "invalid_response"
  | "empty";

export type AiSuccess = { ok: true; content: string; model: string };
export type AiFailure = { ok: false; kind: AiFailureKind; error: string };
export type AiResult = AiSuccess | AiFailure;

export function aiConfigured(): boolean {
  return Boolean(serverEnv.aiApiKey) && !serverEnv.forceAiDisabled;
}

export function aiVisionConfigured(): boolean {
  return aiConfigured() && Boolean(serverEnv.aiVisionModel);
}

type ChatMessage =
  | { role: "system" | "user"; content: string }
  | {
      role: "user";
      content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
    };

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

async function postChat(
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<AiResult> {
  if (!aiConfigured()) {
    return {
      ok: false,
      kind: "not_configured",
      error: "No AI provider is configured for this deployment.",
    };
  }

  const url = `${serverEnv.aiBaseUrl.replace(/\/$/, "")}/chat/completions`;

  const send = async (payload: Record<string, unknown>) =>
    fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serverEnv.aiApiKey}`,
      },
      body: JSON.stringify(payload),
      timeoutMs,
    });

  try {
    let response = await send(body);

    // Some OpenAI-compatible providers reject `response_format`. Retry once
    // without it rather than failing the whole analysis.
    if (response.status === 400) {
      const detail = await response.text().catch(() => "");
      if (/response_format|json_object/i.test(detail)) {
        // Drop `response_format` for providers that do not implement it, then
        // try once more. Rebuilt rather than destructured so no unused binding
        // is created.
        const retryPayload: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(body)) {
          if (key !== "response_format") retryPayload[key] = value;
        }
        response = await send(retryPayload);
      } else {
        return {
          ok: false,
          kind: "http_error",
          error: `The AI provider rejected the request (HTTP 400).`,
        };
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        kind: "http_error",
        error: `The AI provider returned HTTP ${response.status}.`,
      };
    }

    const data = await readJsonBounded<ChatCompletionResponse>(response);
    const content = data.choices?.[0]?.message?.content ?? "";
    if (typeof content !== "string" || content.trim().length === 0) {
      return {
        ok: false,
        kind: "empty",
        error: "The AI provider returned an empty response.",
      };
    }

    return { ok: true, content, model: String(body.model ?? "") };
  } catch (error) {
    if (error instanceof TimeoutError) {
      return {
        ok: false,
        kind: "timeout",
        error: `The AI provider did not respond within ${timeoutMs / 1000} seconds.`,
      };
    }
    return {
      ok: false,
      kind: "invalid_response",
      error: "The AI provider could not be reached.",
    };
  }
}

/** Request the structured safety analysis. */
export async function requestStructuredAnalysis(
  system: string,
  user: string,
): Promise<AiResult> {
  return postChat(
    {
      model: serverEnv.aiModel,
      temperature: 0.1,
      max_tokens: 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ] satisfies ChatMessage[],
    },
    serverEnv.aiTimeoutMs,
  );
}

/**
 * Ask a vision-capable model to read text out of a screenshot.
 *
 * The image is sent only when an operator has explicitly configured a vision
 * model. Without one, screenshots go through the local OCR engine instead
 * (see `lib/ocr.ts`) — the image is never silently uploaded to a provider.
 */
export async function requestVisionText(
  imageDataUrl: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (!aiVisionConfigured()) {
    return { ok: false, error: "No vision model is configured." };
  }

  const result = await postChat(
    {
      model: serverEnv.aiVisionModel,
      temperature: 0,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Transcribe ALL visible text in this screenshot exactly as it appears, preserving line order. Include sender names, phone numbers, amounts and URLs. Reply with a single JSON object: {"text": "..."} . If there is no readable text, return {"text": ""}.',
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ] satisfies ChatMessage[],
    },
    Math.min(serverEnv.aiTimeoutMs + 10_000, 45_000),
  );

  if (!result.ok) return { ok: false, error: result.error };

  try {
    const start = result.content.indexOf("{");
    const end = result.content.lastIndexOf("}");
    const parsed = JSON.parse(result.content.slice(start, end + 1)) as {
      text?: unknown;
    };
    const text = typeof parsed.text === "string" ? parsed.text.trim() : "";
    if (!text) return { ok: false, error: "The vision model found no text." };
    return { ok: true, text: text.slice(0, 8000) };
  } catch {
    return { ok: false, error: "The vision model returned an unreadable response." };
  }
}
