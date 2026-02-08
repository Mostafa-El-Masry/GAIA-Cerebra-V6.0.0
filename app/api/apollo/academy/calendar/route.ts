import { NextResponse } from "next/server";
import type { PathId } from "@/lib/academy";
import {
  getPathsInfoWithCompletion,
  getPathDisplayName,
  getLessonTitle,
} from "@/lib/academy";
import {
  buildSchedule,
  CALENDAR_START,
  CALENDAR_END,
  formatLessonNumber,
  getCalendarPathDisplayName,
} from "@/lib/academy-calendar";

/** GET ?start=2026-03-01&end=2026-12-31 — calendar entries. Completion from DB only. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start") ?? CALENDAR_START;
    const end = searchParams.get("end") ?? CALENDAR_END;

    if (start < CALENDAR_START || end > CALENDAR_END) {
      return NextResponse.json(
        { error: "Calendar range must be between 2026-03-01 and 2026-12-31." },
        { status: 400 },
      );
    }

    const paths = await getPathsInfoWithCompletion();
    const lessonsByPath = Object.fromEntries(
      paths.map((p) => [p.id, p.lessons.map((l) => l.id)]),
    ) as Record<PathId, string[]>;
    const schedule = buildSchedule(lessonsByPath);
    const completedByPath = Object.fromEntries(
      paths.map((p) => [p.id, p.lessons.filter((l) => l.completed).map((l) => l.id)]),
    );

    const entries = schedule
      .filter((e) => e.date >= start && e.date <= end)
      .map((e) => {
        const completed =
          e.pathId !== "sanctum" &&
          e.lessonId != null &&
          (completedByPath[e.pathId] ?? []).includes(e.lessonId);
        return {
          date: e.date,
          pathId: e.pathId,
          lessonId: e.lessonId,
          pathName: getCalendarPathDisplayName(e.pathId),
          lessonNumber: e.lessonId != null ? formatLessonNumber(e.lessonId) : "—",
          title:
            e.pathId !== "sanctum" && e.lessonId != null
              ? getLessonTitle(e.pathId, e.lessonId)
              : null,
          status: completed ? "completed" : "incomplete",
        };
      });

    const studyDays = entries.map((e) => e.date);

    return NextResponse.json({
      entries,
      studyDays,
      calendarStart: CALENDAR_START,
      calendarEnd: CALENDAR_END,
    });
  } catch (e) {
    console.error("Academy calendar error:", e);
    return NextResponse.json(
      { error: "Failed to load calendar." },
      { status: 500 },
    );
  }
}
