"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardData = {
  currentScheduled: {
    pathId: string;
    lessonId: string;
    pathName: string;
    title: string | null;
    date: string;
    status: "completed" | "incomplete";
  } | null;
  lastVisited?: unknown;
  calendarStart?: string;
  calendarEnd?: string;
};

function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * Shows today's learning path and lesson from the Academy schedule.
 */
export default function TodayLearning() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/apollo/academy/dashboard");
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as DashboardData;
        if (cancelled) return;
        setData(json);
      } catch {
        if (!cancelled) setData(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scheduled = data?.currentScheduled ?? null;
  const isToday = scheduled && scheduled.date === todayIso();

  // Only show the lesson block when it’s actually scheduled for today
  if (scheduled && isToday) {
    const lessonLabel = scheduled.title ?? scheduled.lessonId;
    const lessonUrl = `/apollo/academy/lesson/${scheduled.pathId}/${scheduled.lessonId}`;
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--gaia-text-strong)]">
          {scheduled.pathName}
        </p>
        <p className="text-sm text-[var(--gaia-text-default)]">
          {lessonLabel}
        </p>
        <Link
          href={lessonUrl}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--gaia-contrast-bg)] hover:underline"
        >
          Open lesson
          <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  // No lesson today: show Rest and optionally when the next one is
  return (
    <div className="space-y-1 text-sm text-[var(--gaia-text-default)]">
      <p className="font-medium text-[var(--gaia-text-strong)]">Rest</p>
      <p>No lesson scheduled for today.</p>
      {scheduled && (
        <p className="text-xs text-[var(--gaia-text-muted)]">
          Next: {scheduled.pathName} — {scheduled.title ?? scheduled.lessonId} on{" "}
          {scheduled.date}
        </p>
      )}
    </div>
  );
}
