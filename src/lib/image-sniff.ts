/**
 * Image format detection from file contents.
 *
 * Deliberately free of any environment or server dependency so the browser and
 * the server run the *same* validation logic. A declared MIME type is
 * attacker-controlled, so the sniffed format is always what counts.
 */

export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

export const IMAGE_ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_MIME_TYPES.join(",");

export type ImageFormat = "png" | "jpeg" | "webp" | "gif" | "heic";

/** Formats the on-server OCR engine can decode. */
export const OCR_DECODABLE_FORMATS: ImageFormat[] = ["png", "jpeg", "webp", "gif"];

export const MIME_BY_FORMAT: Record<ImageFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
};

/** Default upload ceiling, kept in sync with MAX_UPLOAD_BYTES. */
export const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function sniffImageFormat(bytes: Uint8Array): ImageFormat | null {
  const b = bytes;
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return "png";
  }
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return "webp";
  }
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "gif";
  if (b.length >= 12) {
    const brand = String.fromCharCode(b[4], b[5], b[6], b[7]);
    const minor = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (brand === "ftyp") {
      const heicBrands = ["heic", "heix", "hevc", "hevx", "mif1", "msf1", "heim", "heis"];
      if (heicBrands.some((x) => minor.startsWith(x.slice(0, 4)) || minor === x)) {
        return "heic";
      }
    }
  }
  return null;
}

export type ImageValidation =
  | { ok: true; mimeType: string; format: ImageFormat }
  | {
      ok: false;
      code: "unsupported_type" | "too_large" | "invalid_input";
      message: string;
    };

/**
 * Validate an image by size, magic bytes and MIME consistency.
 * Shared by the browser (fast feedback) and the route handler (enforcement).
 */
export function validateImage(
  bytes: Uint8Array,
  declaredMime: string | null,
  maxBytes = DEFAULT_MAX_UPLOAD_BYTES,
): ImageValidation {
  if (bytes.byteLength === 0) {
    return { ok: false, code: "invalid_input", message: "The uploaded file was empty." };
  }
  if (bytes.byteLength > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      code: "too_large",
      message: `That image is larger than the ${mb} MB limit.`,
    };
  }

  const format = sniffImageFormat(bytes);
  if (!format) {
    return {
      ok: false,
      code: "unsupported_type",
      message: "That file is not a supported image. Use PNG, JPG, WEBP, GIF or HEIC.",
    };
  }

  const sniffed = MIME_BY_FORMAT[format];
  if (declaredMime && declaredMime !== "application/octet-stream") {
    const normalized = declaredMime.toLowerCase();
    const compatible =
      normalized === sniffed ||
      (format === "jpeg" && normalized === "image/jpg") ||
      (format === "heic" && normalized === "image/heif");
    if (!compatible) {
      return {
        ok: false,
        code: "unsupported_type",
        message: `The file claims to be ${normalized} but its contents are ${sniffed}. Upload the original screenshot instead.`,
      };
    }
  }

  return { ok: true, mimeType: sniffed, format };
}
