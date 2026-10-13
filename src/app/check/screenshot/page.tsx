"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Image as ImageIcon,
  ScanText,
  Trash2,
  Upload,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalyzer } from "@/components/analysis/use-analyzer";
import { Card, CardHeader, Alert, Badge } from "@/components/ui/surfaces";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/form";
import {
  DEFAULT_MAX_UPLOAD_BYTES,
  IMAGE_ACCEPT_ATTRIBUTE,
  validateImage,
} from "@/lib/image-sniff";
import { useCapabilities } from "@/components/providers/app-providers";
import { cn } from "@/lib/utils/cn";

/**
 * Screen D — screenshot analyser.
 *
 * Flow: choose → validate in the browser → preview → extract text → the user
 * REVIEWS and can correct the text → analyse.
 *
 * The review step is not optional decoration: OCR misreads characters (0/O, 1/l,
 * ₹/Rs), and analysing a misread message would produce advice about a message
 * the user never received.
 *
 * The image is sent once for extraction and is not retained; the preview URL is
 * revoked on unmount.
 */

type ExtractState =
  | { status: "idle" }
  | { status: "extracting" }
  | { status: "ready"; text: string; engine: string }
  | { status: "error"; message: string; unavailable: boolean };

export default function ScreenshotCheckPage() {
  const { t, lang } = useI18n();
  const caps = useCapabilities();
  const { state, analyzeMessage } = useAnalyzer();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [extract, setExtract] = useState<ExtractState>({ status: "idle" });
  const [editedText, setEditedText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Always release the object URL — otherwise the blob stays alive for the tab.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const analysing = state.status === "loading";
  const serverError = state.status === "error" ? state.error : null;

  async function handleFile(candidate: File) {
    setValidationError(null);
    setExtract({ status: "idle" });
    setEditedText("");

    if (candidate.size > DEFAULT_MAX_UPLOAD_BYTES) {
      setValidationError(t.screenshot.errorTooBig);
      return;
    }

    const buffer = new Uint8Array(await candidate.arrayBuffer());
    const result = validateImage(buffer, candidate.type || null);
    if (!result.ok) {
      setValidationError(
        result.code === "unsupported_type"
          ? t.screenshot.errorUnsupported
          : result.message,
      );
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(candidate);
    setPreviewUrl(URL.createObjectURL(candidate));
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setExtract({ status: "idle" });
    setEditedText("");
    setValidationError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleExtract() {
    if (!file) return;
    setExtract({ status: "extracting" });

    const form = new FormData();
    form.append("image", file);
    form.append("language", lang);

    try {
      const response = await fetch("/api/extract-text", { method: "POST", body: form });
      const payload = (await response.json()) as {
        text?: string;
        engine?: string;
        error?: { message?: string; code?: string };
      };

      if (!response.ok || !payload.text) {
        setExtract({
          status: "error",
          message: payload.error?.message ?? t.screenshot.ocrFailed,
          unavailable:
            response.status === 503 || payload.error?.code === "provider_error",
        });
        return;
      }

      setExtract({
        status: "ready",
        text: payload.text,
        engine: payload.engine ?? "unknown",
      });
      setEditedText(payload.text);
    } catch {
      setExtract({
        status: "error",
        message: t.status.apiDownBody,
        unavailable: true,
      });
    }
  }

  async function handleAnalyse() {
    if (editedText.trim().length === 0) return;
    await analyzeMessage({
      text: editedText,
      language: lang,
      extractedFromImage: true,
    });
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">{t.screenshot.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.screenshot.subtitle}</p>
      </header>

      <Alert tone="info" title={t.privacy.title}>
        {t.screenshot.notRetained}
      </Alert>

      {/* Accuracy matters here: text is read by the on-server OCR engine, which
          is independent of the optional AI vision fallback. We describe the
          real behaviour instead of declaring OCR unavailable. */}
      <Alert tone="info" title={t.screenshot.ocrEngineNoteTitle}>
        {t.screenshot.ocrEngineNoteBody}
      </Alert>

      {!caps.aiVision ? (
        <Alert tone="caution" title={t.screenshot.heicNoteTitle}>
          {t.screenshot.heicNoteBody}
        </Alert>
      ) : null}

      <Card>
        <CardHeader
          title={t.screenshot.dropzone}
          description={t.screenshot.formats}
          icon={<ImageIcon className="size-5 text-primary" aria-hidden="true" />}
        />

        {!file ? (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const dropped = event.dataTransfer.files?.[0];
              if (dropped) void handleFile(dropped);
            }}
            className={cn(
              "mt-4 rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
              dragging
                ? "border-primary bg-primary-soft"
                : "border-border-strong bg-surface-muted",
            )}
          >
            <Upload className="mx-auto size-7 text-muted" aria-hidden="true" />
            <p className="mt-2 text-sm text-muted">{t.screenshot.dropzone}</p>
            <label className="mt-3 inline-flex">
              <span className="sr-only">{t.screenshot.browse}</span>
              <input
                ref={inputRef}
                type="file"
                accept={IMAGE_ACCEPT_ATTRIBUTE}
                className="sr-only"
                onChange={(event) => {
                  const chosen = event.target.files?.[0];
                  if (chosen) void handleFile(chosen);
                }}
              />
              <span className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-border-strong bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-muted">
                {t.screenshot.browse}
              </span>
            </label>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative size-28 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={t.screenshot.preview}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {(file.size / 1024).toFixed(0)} KB · {file.type || "unknown type"}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="mt-1.5"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  {t.screenshot.remove}
                </Button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleExtract}
              loading={extract.status === "extracting"}
              disabled={extract.status === "extracting"}
            >
              <ScanText className="size-4" aria-hidden="true" />
              {extract.status === "extracting" ? t.screenshot.extracting : t.screenshot.extract}
            </Button>
          </div>
        )}

        {validationError ? (
          <div className="mt-3">
            <Alert tone="danger" title={t.common.error}>
              {validationError}
            </Alert>
          </div>
        ) : null}
      </Card>

      {extract.status === "error" ? (
        <Alert
          tone="caution"
          title={extract.unavailable ? t.screenshot.ocrUnavailableTitle : t.screenshot.ocrFailed}
        >
          <p>{extract.message}</p>
          <div className="mt-3">
            <ButtonLink href="/check/text" variant="secondary" size="sm">
              {t.screenshot.openTextChecker}
            </ButtonLink>
          </div>
        </Alert>
      ) : null}

      {extract.status === "ready" ? (
        <Card>
          <CardHeader
            title={t.screenshot.extractedTitle}
            description={t.screenshot.extractedHint}
            icon={<AlertTriangle className="size-5 text-[var(--risk-caution)]" aria-hidden="true" />}
            action={
              <Badge tone="neutral" className="text-[11px]">
                {extract.engine}
              </Badge>
            }
          />
          <div className="mt-3 space-y-3">
            <Field
              label={t.screenshot.extractedTitle}
              htmlFor="trusttap-ocr-text"
              required
              hint={t.screenshot.extractedHint}
            >
              <Textarea
                id="trusttap-ocr-text"
                value={editedText}
                onChange={(event) => setEditedText(event.target.value)}
                rows={8}
                spellCheck={false}
              />
            </Field>

            {serverError ? (
              <Alert tone="danger" title={t.common.error}>
                {serverError.message}
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="lg"
                onClick={handleAnalyse}
                loading={analysing}
                disabled={editedText.trim().length === 0}
              >
                {analysing ? t.common.analyzing : t.screenshot.analyze}
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={clearFile}>
                {t.screenshot.remove}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
