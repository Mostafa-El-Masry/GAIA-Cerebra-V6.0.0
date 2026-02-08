import { NextResponse } from "next/server";
import type { PathId } from "@/lib/academy";
import { getPathsInfoWithCompletion } from "@/lib/academy";
import {
  buildSchedule,
  CALENDAR_START,
  CALENDAR_END,
  getCalendarPathDisplayName,
} from "@/lib/academy-calendar";

/** GET: today's calendar entry (pathId, lessonId, pathName). Used to show Sanctum only on Sanctum days. */
export async function GET() {
  try {
    const todayIso = new Date().toISOString().slice(0, 10);
    if (todayIso < CALENDAR_START || todayIso > CALENDAR_END) {
      return NextResponse.json({
        pathId: null,
        lessonId: null,
        pathName: null,
        isStudyDay: false,
      });
    }

    const paths = await getPathsInfoWithCompletion();
    const lessonsByPath = Object.fromEntries(
      paths.map((p) => [p.id, p.lessons.map((l) => l.id)]),
    ) as Record<PathId, string[]>;
    const schedule = buildSchedule(lessonsByPath);
    const entry = schedule.find((e) => e.date === todayIso);

    if (!entry) {
      return NextResponse.json({
        pathId: null,
        lessonId: null,
        pathName: null,
        isStudyDay: false,
      });
    }

    return NextResponse.json({
      pathId: entry.pathId,
      lessonId: entry.lessonId,
      pathName: getCalendarPathDisplayName(entry.pathId),
      isStudyDay: true,
    });
  } catch (e) {
    console.error("Academy today error:", e);
    return NextResponse.json(
      { error: "Failed to load today's entry." },
      { status: 500 },
    );
  }
}
