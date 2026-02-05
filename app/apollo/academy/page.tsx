"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type LessonItem = { id: string; completed: boolean };
type PathItem = {
  id: string;
  name: string;
  totalLessons: number;
  completedLessons: number;
  lessons: LessonItem[];
};

export default function AcademyDashboardPage() {
  const [paths, setPaths] = useState<PathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchPaths = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/apollo/academy/paths");
      if (!res.ok) throw new Error("Failed to load paths");
      const data = (await res.json()) as { paths: PathItem[] };
      setPaths(data.paths ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load academy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const handleDelete = useCallback(
    async (pathId: string, lessonId: string) => {
      const key = `${pathId}:${lessonId}`;
      setDeleting(key);
      try {
        const res = await fetch("/api/apollo/academy/lessons", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pathId, lessonId }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error ?? "Delete failed");
        }
        await fetchPaths();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setDeleting(null);
      }
    },
    [fetchPaths],
  );

  const handleToggleComplete = useCallback(
    async (pathId: string, lessonId: string, completed: boolean) => {
      const key = `${pathId}:${lessonId}`;
      setToggling(key);
      try {
        const res = await fetch("/api/apollo/academy/lessons/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pathId, lessonId, completed }),
        });
        if (!res.ok) throw new Error("Update failed");
        await fetchPaths();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Update failed");
      } finally {
        setToggling(null);
      }
    },
    [fetchPaths],
  );

  if (loading && paths.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-[var(--gaia-text-muted)]">Loading academy…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-semibold text-[var(--gaia-text-strong)] mb-2">
        Academy
      </h1>
      <p className="text-sm text-[var(--gaia-text-muted)] mb-6">
        File-driven paths. Progress is completed / total lessons.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {paths.map((path) => (
          <section
            key={path.id}
            className="rounded-xl border gaia-border bg-[var(--gaia-surface)] p-4 shadow-sm"
          >
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h2 className="text-base font-semibold text-[var(--gaia-text-strong)]">
                {path.name}
              </h2>
              <span className="text-sm text-[var(--gaia-text-muted)] tabular-nums">
                {path.completedLessons} / {path.totalLessons}
              </span>
            </div>
            {path.lessons.length > 0 ? (
              <ul className="space-y-1">
                {path.lessons.map((lesson) => {
                  const key = `${path.id}:${lesson.id}`;
                  const isDeleting = deleting === key;
                  const isToggling = toggling === key;
                  return (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between gap-2 rounded-lg border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm"
                    >
                      <label className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={lesson.completed}
                          disabled={isToggling}
                          onChange={() =>
                            handleToggleComplete(
                              path.id,
                              lesson.id,
                              !lesson.completed,
                            )
                          }
                          className="rounded border gaia-border"
                        />
                        <Link
                          href={`/apollo/academy/lesson/${path.id}/${lesson.id}`}
                          className="truncate text-[var(--gaia-text-default)] underline hover:text-[var(--gaia-text-strong)]"
                        >
                          {lesson.id}
                        </Link>
                      </label>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(path.id, lesson.id)}
                        className="shrink-0 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[var(--gaia-text-muted)]">
                No lessons yet. Add .md files in Academy/lessons/{path.id}/lessons/
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
