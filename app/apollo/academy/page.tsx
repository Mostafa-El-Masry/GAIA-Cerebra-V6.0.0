"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type LessonItem = { id: string; completed: boolean; title?: string | null; requiredMinutes?: number };
type PathItem = {
  id: string;
  name: string;
  totalLessons: number;
  completedLessons: number;
  lessons: LessonItem[];
};

type DashboardData = {
  lastVisited: {
    pathId: string;
    lessonId: string;
    pathName: string;
    title: string | null;
    openedAt: string;
  } | null;
  currentScheduled: {
    pathId: string;
    lessonId: string;
    pathName: string;
    title: string | null;
    date: string;
    status: "completed" | "incomplete";
  } | null;
  todayEntry: {
    date: string;
    pathId: string;
    lessonId: string;
    pathName: string;
    lessonNumber: string;
    title: string | null;
    status: "completed" | "incomplete";
  } | null;
  calendarStart: string;
  calendarEnd: string;
};

export default function AcademyDashboardPage() {
  const [paths, setPaths] = useState<PathItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedPathIds, setExpandedPathIds] = useState<Set<string>>(new Set());

  const togglePath = (pathId: string) => {
    setExpandedPathIds((prev) => {
      const next = new Set(prev);
      if (next.has(pathId)) next.delete(pathId);
      else next.add(pathId);
      return next;
    });
  };

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

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/apollo/academy/dashboard");
      if (!res.ok) return;
      const data = (await res.json()) as DashboardData;
      setDashboard(data);
    } catch {
      setDashboard(null);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchPaths();
    fetchDashboard();
  }, [fetchPaths, fetchDashboard]);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
        await refreshAll();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setDeleting(null);
      }
    },
    [refreshAll],
  );

  if (loading && paths.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--gaia-surface)] text-[var(--gaia-text-default)]">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-sm text-[var(--gaia-text-muted)]">Loading academy…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gaia-surface)] text-[var(--gaia-text-default)]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-xl font-semibold text-[var(--gaia-text-strong)] mb-6">
          Academy
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-[var(--gaia-warning-border)] bg-[var(--gaia-warning-bg)] px-3 py-2 text-sm text-[var(--gaia-warning)]">
            {error}
          </div>
        )}

        {/* Dashboard (read-only): last visited + current scheduled + today calendar day */}
        <section className="mb-8 rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--gaia-text-muted)] mb-3">
            Dashboard
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
            <div className="rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-3">
            <p className="text-[11px] font-semibold uppercase text-[var(--gaia-text-muted)]">
              Last lesson visited
            </p>
            {dashboard?.lastVisited ? (
              <>
                <p className="mt-1 font-medium text-[var(--gaia-text-strong)]">
                  {dashboard.lastVisited.title ?? dashboard.lastVisited.lessonId}
                </p>
                <p className="text-sm text-[var(--gaia-text-muted)]">
                  {dashboard.lastVisited.pathName}
                </p>
                <p className="text-xs text-[var(--gaia-text-muted)]">
                  {new Date(dashboard.lastVisited.openedAt).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-[var(--gaia-text-muted)]">
                None yet
              </p>
            )}
            </div>
            <div className="rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-3">
              <p className="text-[11px] font-semibold uppercase text-[var(--gaia-text-muted)]">
                Current scheduled lesson
              </p>
              {dashboard?.currentScheduled ? (
                <>
                  <p className="mt-1 font-medium text-[var(--gaia-text-strong)]">
                    {dashboard.currentScheduled.title ??
                      dashboard.currentScheduled.lessonId}
                  </p>
                  <p className="text-sm text-[var(--gaia-text-muted)]">
                    {dashboard.currentScheduled.pathName} ·{" "}
                    {dashboard.currentScheduled.date}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      dashboard.currentScheduled.status === "completed"
                        ? "text-[var(--gaia-positive)]"
                        : "text-[var(--gaia-negative)]"
                    }`}
                  >
                    {dashboard.currentScheduled.status === "completed"
                      ? "Completed"
                      : "Incomplete"}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-[var(--gaia-text-muted)]">
                  No upcoming study day in range
                </p>
              )}
            </div>
            {/* Today: 1-day calendar cell, fixed width, same line to the right */}
            <Link
              href="/apollo/academy/calendar"
              className="flex w-52 min-w-52 shrink-0 flex-col rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-3 text-center transition hover:opacity-90 min-h-[10.5rem]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gaia-text-muted)]">
                Today
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--gaia-text-strong)]">
                {dashboard?.todayEntry
                  ? new Date(dashboard.todayEntry.date + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
              </p>
              {dashboard?.todayEntry ? (
                <>
                  <p className="mt-2 text-xs text-[var(--gaia-text-default)] line-clamp-2">
                    {dashboard.todayEntry.pathName} · {dashboard.todayEntry.lessonNumber}
                    {dashboard.todayEntry.title ? ` — ${dashboard.todayEntry.title}` : ""}
                  </p>
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      dashboard.todayEntry.status === "completed"
                        ? "text-[var(--gaia-positive)]"
                        : "text-[var(--gaia-negative)]"
                    }`}
                  >
                    {dashboard.todayEntry.status === "completed"
                      ? "Completed"
                      : "Incomplete"}
                  </p>
                </>
              ) : (
                <p className="mt-2 flex-1 text-sm text-[var(--gaia-text-muted)]">
                  No study day today
                </p>
              )}
              <p className="mt-auto pt-2 text-xs font-medium text-[var(--gaia-text-muted)]">
                Learning calendar →
              </p>
            </Link>
          </div>
        </section>

        {/* Paths and lessons — click path to expand/collapse */}
        <div className="space-y-4">
          {paths.map((path) => {
            const isExpanded = expandedPathIds.has(path.id);
            return (
              <section
                key={path.id}
                className="rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => togglePath(path.id)}
                  className="flex w-full items-center justify-between gap-2 p-4 text-left text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface)] transition"
                >
                <h2 className="text-base font-semibold text-[var(--gaia-text-strong)]">
                  {path.name}
                </h2>
                <span className="flex items-center gap-2 text-sm text-[var(--gaia-text-muted)]">
                  <span className="tabular-nums">{path.completedLessons} / {path.totalLessons}</span>
                  <span
                    className={`inline-block transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    ▼
                  </span>
                </span>
              </button>
                {isExpanded && (
                  <div className="border-t border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-4 pt-0">
                    {path.lessons.length > 0 ? (
                      <ul className="space-y-1">
                        {path.lessons.map((lesson) => {
                          const key = `${path.id}:${lesson.id}`;
                          const isDeleting = deleting === key;
                          const duration = lesson.requiredMinutes != null ? `${lesson.requiredMinutes} min` : "15 min";
                          return (
                            <li
                              key={lesson.id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm text-[var(--gaia-text-default)]"
                            >
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/apollo/academy/lesson/${path.id}/${lesson.id}`}
                                className="truncate font-medium text-[var(--gaia-text-default)] underline hover:text-[var(--gaia-text-strong)]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {lesson.title ?? lesson.id}
                              </Link>
                              <p className="mt-0.5 text-xs text-[var(--gaia-text-muted)]">
                                {duration}
                                {lesson.completed && (
                                  <span className="ml-2 font-medium text-[var(--gaia-positive)]">Completed</span>
                                )}
                              </p>
                            </div>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(path.id, lesson.id);
                                }}
                                className="gaia-btn-negative shrink-0 rounded border px-2 py-1 text-xs font-medium disabled:opacity-50"
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
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
