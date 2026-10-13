import { jsonError, jsonOk, handleRoute } from "@/lib/http/respond";
import { checkRateLimit, clientKey } from "@/lib/http/rate-limit";
import { serverEnv } from "@/lib/env";
import { ocrLanguageFor, extractText } from "@/lib/ocr";
import { aiVisionConfigured, requestVisionText } from "@/lib/analysis/ai/provider";
import { OCR_DECODABLE_FORMATS, validateImage } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/extract-text
 *
 * multipart/form-data with:
 *   - `image`    the screenshot
 *   - `language` optional "en" | "hi"
 *
 * Extraction order (privacy first):
 *   1. Local Tesseract OCR — nothing leaves the server.
 *   2. If OCR cannot decode the format or finds nothing AND a vision model is
 *      configured, ask that model.
 *
 * The uploaded image is processed in memory and is never written to disk or to
 * a database. It is not logged.
 */
export async function POST(request: Request) {
  return handleRoute("extract-text", async () => {
    const limit = checkRateLimit(clientKey(request));
    if (!limit.allowed) {
      return jsonError(
        "rate_limited",
        `Too many uploads in a short time. Please wait ${limit.retryAfter} seconds and try again.`,
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return jsonError(
        "invalid_input",
        "The upload could not be read. Please choose the file again.",
        { status: 400 },
      );
    }

    const file = form.get("image");
    if (!(file instanceof File)) {
      return jsonError("invalid_input", "No image was included in the upload.", {
        status: 422,
        fields: { image: "Please choose a screenshot to upload." },
      });
    }

    if (file.size > serverEnv.maxUploadBytes) {
      const mb = (serverEnv.maxUploadBytes / (1024 * 1024)).toFixed(1);
      return jsonError("too_large", `That image is larger than the ${mb} MB limit.`, {
        status: 413,
        fields: { image: `Maximum size is ${mb} MB.` },
      });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const validation = validateImage(bytes, file.type || null);
    if (!validation.ok) {
      const status = validation.code === "too_large" ? 413 : 415;
      return jsonError(validation.code, validation.message, {
        status,
        fields: { image: validation.message },
      });
    }

    const languageHint = String(form.get("language") ?? "en");
    const ocrLanguage = ocrLanguageFor(languageHint);

    // 1. Local OCR.
    if (OCR_DECODABLE_FORMATS.includes(validation.format)) {
      const ocr = await extractText(bytes, {
        language: ocrLanguage,
        format: validation.format,
      });
      if (ocr.ok) {
        return jsonOk({
          ok: true,
          text: ocr.text,
          engine: ocr.engine,
          language: ocr.language,
          visionUsed: false,
        });
      }

      // 2. Vision fallback, only when OCR could not produce text.
      if (aiVisionConfigured() && ocr.reason !== "unsupported_format") {
        const vision = await requestVisionText(
          `data:${validation.mimeType};base64,${Buffer.from(bytes).toString("base64")}`,
        );
        if (vision.ok) {
          return jsonOk({
            ok: true,
            text: vision.text,
            engine: "ai_vision",
            language: ocrLanguage,
            visionUsed: true,
          });
        }
      }

      const status = ocr.reason === "no_text" ? 422 : 503;
      return jsonError(
        ocr.reason === "no_text" ? "invalid_input" : "provider_error",
        ocr.message,
        { status },
      );
    }

    // HEIC and anything else OCR cannot decode: the vision model is the only
    // path, and it is optional. Say so plainly.
    if (aiVisionConfigured()) {
      const vision = await requestVisionText(
        `data:${validation.mimeType};base64,${Buffer.from(bytes).toString("base64")}`,
      );
      if (vision.ok) {
        return jsonOk({
          ok: true,
          text: vision.text,
          engine: "ai_vision",
          language: ocrLanguage,
          visionUsed: true,
        });
      }
      return jsonError("provider_error", vision.error, { status: 503 });
    }

    return jsonError(
      "provider_error",
      "This image format cannot be read by the on-server OCR engine, and no vision model is configured. Please export the screenshot as PNG or JPG, or type the text in manually.",
      { status: 503 },
    );
  });
}
