import { z } from "zod";
import { CONTENT_TYPES, type ContentType } from "@/lib/types";
import { serverEnv } from "@/lib/env";
import { validateImage as validateImageShared } from "@/lib/image-sniff";

/**
 * Server-side request validation.
 *
 * Image sniffing and format rules live in `lib/image-sniff.ts` so the browser
 * and the server apply exactly the same checks. This module adds the
 * environment-aware pieces (upload ceiling, message length) and the Zod schemas
 * used by the route handlers.
 */

const contentTypeSchema = z.enum(CONTENT_TYPES);
const languageSchema = z.enum(["en", "hi"]);

export const analyzeRequestSchema = z.object({
  text: z
    .string()
    .min(1, "Please paste some content before checking.")
    .max(
      serverEnv.maxMessageChars + 200,
      `That is longer than the ${serverEnv.maxMessageChars} character limit. Please shorten it.`,
    ),
  contentType: z.union([contentTypeSchema, z.literal("")]).optional(),
  language: languageSchema.optional(),
  extractedFromImage: z.boolean().optional(),
});

export const urlRequestSchema = z.object({
  url: z
    .string()
    .min(3, "Please enter a web address.")
    .max(2048, "That address is too long."),
  language: languageSchema.optional(),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;
export type UrlRequestInput = z.infer<typeof urlRequestSchema>;

/** Map Zod issues onto a field->message map for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

/** Normalise a possibly-empty content-type string to a valid enum or undefined. */
export function normalizeContentType(value: string | undefined): ContentType | undefined {
  if (!value) return undefined;
  return (CONTENT_TYPES as readonly string[]).includes(value)
    ? (value as ContentType)
    : undefined;
}

/** Server-enforced image validation, using the configured upload ceiling. */
export function validateUpload(bytes: Uint8Array, declaredMime: string | null) {
  return validateImageShared(bytes, declaredMime, serverEnv.maxUploadBytes);
}

export {
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_ACCEPT_ATTRIBUTE,
  OCR_DECODABLE_FORMATS,
  sniffImageFormat,
  validateImage,
  type ImageFormat,
  type ImageValidation,
} from "@/lib/image-sniff";
