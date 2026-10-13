import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEARNING_TOPICS, getTopic } from "@/lib/content/learning";
import { TopicView } from "@/components/learn/topic-view";

/**
 * Lesson route.
 *
 * Statically enumerable, so every lesson is prerenderable and each gets its own
 * title and description for sharing.
 */
export function generateStaticParams() {
  return LEARNING_TOPICS.map((topic) => ({ slug: topic.slug }));
}

/**
 * `params` is a Promise in Next.js 16 and must be awaited.
 * Typed explicitly rather than via the generated `PageProps` helper so that
 * `npm run typecheck` is useful on a clean checkout, before any build has run
 * route type generation.
 */
type LessonRouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: LessonRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return { title: "Lesson not found" };
  return {
    title: topic.title.en,
    description: topic.summary.en,
  };
}

export default async function LessonPage({ params }: LessonRouteProps) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();
  return <TopicView topic={topic} />;
}
