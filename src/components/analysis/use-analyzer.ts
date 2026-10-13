"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { lastResultStoreApi } from "@/lib/storage/store";
import type { AnalysisResult, ContentType, Language } from "@/lib/types-app";

/**
 * Client-side driver for the analysis endpoints.
 *
 * Responsibilities:
 *  - call the right endpoint,
 *  - distinguish a *network* failure from a *service* failure so the message the
 *    user sees is accurate ("we could not reach the service" vs "the service
 *    rejected your input"),
 *  - persist the result for the results screen,
 *  - never invent a result on failure.
 */

export type AnalyzerError = {
  kind: "network" | "timeout" | "rate_limited" | "invalid_input" | "service";
  message: string;
  fields?: Record<string, string>;
  retryAfter?: number;
};

export type AnalyzerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: AnalyzerError }
  | { status: "success"; result: AnalysisResult };

const CLIENT_TIMEOUT_MS = 70_000;

export function useAnalyzer() {
  const router = useRouter();
  const [state, setState] = useState<AnalyzerState>({ status: "idle" });

  const reset = useCallback(() => setState({ status: "idle" }), []);

  const post = useCallback(
    async (path: string, body: unknown): Promise<AnalyzerState> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

      try {
        const response = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          let message = "The analysis could not be completed.";
          let fields: Record<string, string> | undefined;
          let retryAfter: number | undefined;

          try {
            const payload = (await response.json()) as {
              error?: { code?: string; message?: string; fields?: Record<string, string> };
            };
            if (payload.error?.message) message = payload.error.message;
            fields = payload.error?.fields;
          } catch {
            // Non-JSON error body: keep the generic message.
          }

          if (response.status === 429) {
            const header = response.headers.get("Retry-After");
            retryAfter = header ? Number(header) : undefined;
            return {
              status: "error",
              error: {
                kind: "rate_limited",
                message,
                retryAfter: Number.isFinite(retryAfter) ? retryAfter : undefined,
              },
            };
          }

          return {
            status: "error",
            error: {
              kind: response.status === 422 || response.status === 413 ? "invalid_input" : "service",
              message,
              fields,
            },
          };
        }

        const result = (await response.json()) as AnalysisResult;
        // Written through the store so the results screen re-renders without a
        // reload, and any failure to persist does not hide the result itself.
        lastResultStoreApi.set(result);
        return { status: "success", result };
      } catch (error) {
        const aborted = error instanceof DOMException && error.name === "AbortError";
        return {
          status: "error",
          error: {
            kind: aborted ? "timeout" : "network",
            message: aborted
              ? "The analysis took too long to come back."
              : "We could not reach the analysis service.",
          },
        };
      } finally {
        clearTimeout(timer);
      }
    },
    [],
  );

  const analyzeMessage = useCallback(
    async (input: {
      text: string;
      contentType?: ContentType;
      language: Language;
      extractedFromImage?: boolean;
      navigate?: boolean;
    }) => {
      setState({ status: "loading" });
      const next = await post("/api/analyze", {
        text: input.text,
        contentType: input.contentType ?? "",
        language: input.language,
        extractedFromImage: input.extractedFromImage,
      });
      setState(next);
      if (next.status === "success" && input.navigate !== false) {
        router.push("/results");
      }
      return next;
    },
    [post, router],
  );

  const checkUrl = useCallback(
    async (input: { url: string; language: Language; navigate?: boolean }) => {
      setState({ status: "loading" });
      const next = await post("/api/url-check", {
        url: input.url,
        language: input.language,
      });
      setState(next);
      if (next.status === "success" && input.navigate !== false) {
        router.push("/results");
      }
      return next;
    },
    [post, router],
  );

  return { state, analyzeMessage, checkUrl, reset };
}
