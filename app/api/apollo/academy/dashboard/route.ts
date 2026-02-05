import { NextResponse } from "next/server";
import {
  getPathsInfo,
  getLastVisited,
  getPathDisplayName,
  getLessonTitle,
  getCompletedIds,
} from "@/lib/academy";
import type { PathId } from "@/lib/academy";
import {
  buildSchedule,
  CALENDAR_START,
  CALENDAR_END,
} from "@/lib/academy-calendar";

/** GET: dashboard data — last visited lesson + current scheduled lesson. */
export async function GET() {
  try {
    const paths = getPathsInfo();
    const lessonsByPath = Object.fromEntries(
      paths.map((p) => [p.id, p.lessons.map((l) => l.id)]),
    ) as Record<PathId, string[]>;
    const schedule = buildSchedule(lessonsByPath);
    const completedByPath = Object.fromEntries(
      paths.map((p) => [p.id, getCompletedIds(p.id)]),
    );

    const lastVisited = getLastVisited();
    let lastVisitedPayload: {
      pathId: string;
      lessonId: string;
      pathName: string;
      title: string | null;
      openedAt: string;
    } | null = null;
    if (lastVisited) {
      lastVisitedPayload = {
        pathId: lastVisited.pathId,
        lessonId: lastVisited.lessonId,
        pathName: getPathDisplayName(lastVisited.pathId),
        title: getLessonTitle(lastVisited.pathId, lastVisited.lessonId),
        openedAt: lastVisited.openedAt,
      };
    }

    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);
    const nextEntry = schedule.find((e) => e.date >= todayIso);
    let currentScheduled: {
      pathId: string;
      lessonId: string;
      pathName: string;
      title: string | null;
      date: string;
      status: "completed" | "incomplete";
    } | null = null;
    if (nextEntry) {
      const completed = (completedByPath[nextEntry.pathId] ?? []).includes(
        nextEntry.lessonId,
      );
      currentScheduled = {
        pathId: nextEntry.pathId,
        lessonId: nextEntry.lessonId,
        pathName: getPathDisplayName(nextEntry.pathId),
        title: getLessonTitle(nextEntry.pathId, nextEntry.lessonId),
        date: nextEntry.date,
        status: completed ? "completed" : "incomplete",
      };
    }

    return NextResponse.json({
      lastVisited: lastVisitedPayload,
      currentScheduled,
      calendarStart: CALENDAR_START,
      calendarEnd: CALENDAR_END,
    });
  } catch (e) {
    console.error("Academy dashboard error:", e);
    return NextResponse.json(
      { error: "Failed to load dashboard." },
      { status: 500 },
    );
  }
}
