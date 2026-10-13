import type { Metadata } from "next";
import { TextCheckClient } from "./text-check-client";

/**
 * Screen C — message analyser.
 *
 * A server component so the practice example can be selected from the query
 * string during rendering. That keeps the client free of mount-time state
 * juggling and avoids a hydration mismatch, and the URL never carries any user
 * content.
 */
export const metadata: Metadata = {
  title: "Check a message",
  description:
    "Paste a suspicious SMS, WhatsApp message, email or offer and see the warning signs in plain language, in English or Hindi.",
};

type SearchParams = Promise<{ example?: string }>;

export default async function TextCheckPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return <TextCheckClient isExample={params.example === "1"} />;
}
