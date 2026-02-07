import { NextResponse } from "next/server";
import type { PathId } from "@/lib/academy";
import { getPathDisplayName } from "@/lib/academy";
import { getPathsInfoWithCompletion } from "@/lib/academy";
import { setLessonCompleted } from "@/lib/academy-db";

const VALID_PATH_IDS: PathId[] = [
  "web-fundamentals",
  "financial-literacy",
  "sanctum",
  "self-healing",
];

type Body = { pathId?: string; lessonId?: string };

/** POST: commit lesson completion (irreversible). Only call after timer + quiz 100% in same session. */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const pathId = body.pathId as PathId | undefined;
    const lessonId = body.lessonId;

    if (!pathId || !lessonId) {
      return NextResponse.json(
        { error: "pathId and lessonId are required." },
        { status: 400 },
      );
    }
    if (!VALID_PATH_IDS.includes(pathId)) {
      return NextResponse.json(
        { error: "Invalid pathId." },
        { status: 400 },
      );
    }

    const result = await setLessonCompleted(pathId, String(lessonId).trim());
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Failed to commit completion." },
        { status: 400 },
      );
    }

    const paths = await getPathsInfoWithCompletion();
    const pathInfo = paths.find((p) => p.id === pathId);
    const completed = pathInfo?.completedLessons ?? 0;
    const total = pathInfo?.totalLessons ?? 0;
    const pathName = pathInfo ? getPathDisplayName(pathId) : "";

    return NextResponse.json({
      ok: true,
      pathProgress: {
        pathName,
        completed,
        total,
      },
    });
  } catch (e) {
    console.error("Academy commit completion error:", e);
    return NextResponse.json(
      { error: "Failed to commit completion." },
      { status: 500 },
    );
  }
}
