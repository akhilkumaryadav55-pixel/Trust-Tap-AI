/**
 * Joins class names, dropping falsy values.
 * Deliberately dependency-free — no `clsx`/`tailwind-merge` needed at this
 * scale, and this keeps the client bundle tiny.
 */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}
