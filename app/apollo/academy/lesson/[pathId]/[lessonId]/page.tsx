"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type LessonData = {
  content: string;
  pathId: string;
  pathName: string;
  lessonId: string;
};

export default function AcademyLessonPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const lessonId = params.lessonId as string;
  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!pathId || !lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/apollo/academy/lessons/content?pathId=${encodeURIComponent(pathId)}&lessonId=${encodeURIComponent(lessonId)}`,
      );
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to load lesson");
      }
      const json = (await res.json()) as LessonData;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  }, [pathId, lessonId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-[var(--gaia-text-muted)]">Loading lesson…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-red-600">{error ?? "Lesson not found."}</p>
        <Link
          href="/apollo/academy"
          className="mt-4 inline-block text-sm font-medium text-[var(--gaia-text-default)] underline"
        >
          Back to Academy
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/apollo/academy"
        className="mb-6 inline-block text-sm font-medium text-[var(--gaia-text-muted)] hover:text-[var(--gaia-text-default)]"
      >
        ← Back to Academy
      </Link>
      <p className="mb-2 text-xs uppercase tracking-wider text-[var(--gaia-text-muted)]">
        {data.pathName}
      </p>
      <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-[var(--gaia-text-default)] prose-ul:text-[var(--gaia-text-default)] prose-li:text-[var(--gaia-text-default)]">
        <ReactMarkdown>{data.content}</ReactMarkdown>
      </article>
    </div>
  );
}
