import { NextResponse } from "next/server";
import {
  getPathsInfoWithCompletion,
  getLastVisited,
  getPathDisplayName,
  getLessonTitle,
} from "@/lib/academy";
import type { PathId } from "@/lib/academy";
import {
  buildSchedule,
  CALENDAR_START,
  CALENDAR_END,
  formatLessonNumber,
} from "@/lib/academy-calendar";

/** GET: dashboard data — last visited lesson + current scheduled lesson. Completion from DB only. */
export async function GET() {
  try {
    const paths = await getPathsInfoWithCompletion();
    const lessonsByPath = Object.fromEntries(
      paths.map((p) => [p.id, p.lessons.map((l) => l.id)]),
    ) as Record<PathId, string[]>;
    const schedule = buildSchedule(lessonsByPath);
    const completedByPath = Object.fromEntries(
      paths.map((p) => [p.id, p.lessons.filter((l) => l.completed).map((l) => l.id)]),
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
    const PATH_STAGES: Record<PathId, string> = {
      "web-fundamentals": "Skills phase",
      "financial-literacy": "Applied phase",
    };
    const PATH_FUTURE: Record<PathId, string> = {
      "web-fundamentals": "Builds toward technical fluency and project capability.",
      "financial-literacy": "Builds toward informed financial decisions.",
    };

    let currentScheduled: {
      pathId: string;
      lessonId: string;
      pathName: string;
      title: string | null;
      date: string;
      status: "completed" | "incomplete";
      context?: {
        reasonNext: string;
        stage: string;
        futureRelevance: string;
      };
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
        context: {
          reasonNext:
            "Scheduled by calendar rotation (Web Fundamentals → Financial Literacy).",
          stage: PATH_STAGES[nextEntry.pathId] ?? "Current phase",
          futureRelevance: PATH_FUTURE[nextEntry.pathId] ?? "Builds toward path completion.",
        },
      };
    }

    let todayEntry: {
      date: string;
      pathId: string;
      lessonId: string;
      pathName: string;
      lessonNumber: string;
      title: string | null;
      status: "completed" | "incomplete";
    } | null = null;
    if (todayIso >= CALENDAR_START && todayIso <= CALENDAR_END) {
      const entry = schedule.find((e) => e.date === todayIso);
      if (entry) {
        const completed = (completedByPath[entry.pathId] ?? []).includes(
          entry.lessonId,
        );
        todayEntry = {
          date: entry.date,
          pathId: entry.pathId,
          lessonId: entry.lessonId,
          pathName: getPathDisplayName(entry.pathId),
          lessonNumber: formatLessonNumber(entry.lessonId),
          title: getLessonTitle(entry.pathId, entry.lessonId),
          status: completed ? "completed" : "incomplete",
        };
      }
    }

    return NextResponse.json({
      lastVisited: lastVisitedPayload,
      currentScheduled,
      todayEntry,
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
