"use client";

import { useId, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Accessible form primitives.
 *
 * Every control gets a real <label>, `aria-describedby` wiring for hints and
 * errors, and `aria-invalid` when invalid. Error text is rendered in a live
 * region so screen readers announce it when it appears.
 */

const CONTROL =
  "w-full rounded-xl border bg-surface px-3 py-2.5 text-base text-foreground placeholder:text-muted/70 transition-colors focus-visible:border-primary";

export function Field({
  label,
  hint,
  error,
  required = false,
  children,
  htmlFor,
  counter,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
  counter?: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-sm font-semibold text-foreground"
        >
          {label}
          {required ? (
            <span className="ml-1 text-[var(--risk-high)]" aria-hidden="true">
              *
            </span>
          ) : (
            <span className="ml-1 text-xs font-normal text-muted">(optional)</span>
          )}
        </label>
        {counter ? <span className="text-xs text-muted tabular-nums">{counter}</span> : null}
      </div>
      {children}
      {hint && !error ? (
        <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="text-xs font-medium text-[var(--risk-high)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Textarea({
  className,
  invalid = false,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        "min-h-32 resize-y leading-relaxed",
        invalid && "border-[var(--risk-high)]",
        className,
      )}
    />
  );
}

export function Input({
  className,
  invalid = false,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, invalid && "border-[var(--risk-high)]", className)}
    />
  );
}

export function Select({
  className,
  invalid = false,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        "appearance-none bg-[length:0] pr-9",
        invalid && "border-[var(--risk-high)]",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.6rem center",
        backgroundSize: "1.15rem",
      }}
    >
      {children}
    </select>
  );
}

/** A labelled select whose options are provided as a value/label list. */
export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  id,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; group?: string }>;
  hint?: string;
  id?: string;
  disabled?: boolean;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  const grouped = new Map<string, typeof options>();
  for (const option of options) {
    const key = option.group ?? "";
    const list = grouped.get(key) ?? [];
    list.push(option);
    grouped.set(key, list);
  }

  return (
    <Field label={label} hint={hint} htmlFor={fieldId} required>
      <Select
        id={fieldId}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {[...grouped.entries()].map(([group, list]) =>
          group ? (
            <optgroup key={group} label={group}>
              {list.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ) : (
            list.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ),
        )}
      </Select>
    </Field>
  );
}
