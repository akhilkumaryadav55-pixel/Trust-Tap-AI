import os from "node:os";
import path from "node:path";

/**
 * Local OCR.
 *
 * Screenshot text extraction uses Tesseract.js, which runs entirely on this
 * server. Two consequences we must be honest about:
 *
 *  - The first run downloads language data from a CDN. On an offline or
 *    egress-restricted host the engine reports itself as unavailable rather than
 *    returning empty text as if the image contained no words.
 *  - Tesseract does not decode HEIC, so iPhone screenshots must be converted.
 *
 * `extractText` never invents text. If it cannot read anything it says so.
 */

export type OcrLanguage = "eng" | "hin";

export type OcrResult =
  | { ok: true; text: string; engine: "tesseract"; language: OcrLanguage }
  | {
      ok: false;
      reason: "unsupported_format" | "unavailable" | "no_text" | "failed";
      message: string;
    };

/** Guard so a hung worker cannot pin a request open. */
const OCR_TIMEOUT_MS = 25_000;
const TIMEOUT_SENTINEL = "__trusttap_ocr_timeout__";

/** Minimal structural type for the parts of the Tesseract worker we use. */
type TesseractWorker = {
  recognize: (image: Buffer) => Promise<{ data?: { text?: string } }>;
  terminate: () => Promise<unknown>;
};

export function ocrLanguageFor(language: string | null | undefined): OcrLanguage {
  return language === "hi" ? "hin" : "eng";
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(TIMEOUT_SENTINEL)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function extractText(
  bytes: Uint8Array,
  options: { language?: OcrLanguage; format?: string } = {},
): Promise<OcrResult> {
  const language = options.language ?? "eng";

  if (options.format === "heic") {
    return {
      ok: false,
      reason: "unsupported_format",
      message:
        "HEIC images cannot be read by the on-server OCR engine. Please export the screenshot as PNG or JPG, or type the text in manually.",
    };
  }

  let worker: TesseractWorker | null = null;

  try {
    const { createWorker } = await import("tesseract.js");

    worker = (await withTimeout(
      createWorker(language, 1, {
        cachePath: path.join(os.tmpdir(), "trusttap-tesseract"),
        // Tesseract is very chatty; keep the server log readable.
        logger: () => undefined,
      }) as unknown as Promise<TesseractWorker>,
      OCR_TIMEOUT_MS,
    )) as TesseractWorker;

    const result = await withTimeout(worker.recognize(Buffer.from(bytes)), OCR_TIMEOUT_MS);
    const text = (result?.data?.text ?? "").replace(/[ \t]+\n/g, "\n").trim();

    // Punctuation and whitespace alone is not text.
    if (text.replace(/[\s\p{P}]/gu, "").length < 2) {
      return {
        ok: false,
        reason: "no_text",
        message:
          "The OCR engine could not find readable text in that image. Try a sharper, larger screenshot — or type the message in manually.",
      };
    }

    return { ok: true, text: text.slice(0, 8000), engine: "tesseract", language };
  } catch (error) {
    const timedOut =
      error instanceof Error && error.message === TIMEOUT_SENTINEL;
    return {
      ok: false,
      reason: timedOut ? "failed" : "unavailable",
      message: timedOut
        ? "Reading the image took too long and was stopped. Try a smaller screenshot."
        : "The OCR engine could not be started on this server. This usually means it cannot download its language data, or the deployment blocks worker threads.",
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Terminating a broken worker is best-effort.
      }
    }
  }
}
