import { NextResponse } from "next/server";
import type { PathId } from "@/lib/academy";
import { getLessonMeta, getQuizzesForLesson } from "@/lib/academy-db";

const VALID_PATH_IDS: PathId[] = [
  "web-fundamentals",
  "financial-literacy",
  "sanctum",
];

/** GET ?pathId= &lessonId= — returns 10 quiz questions for the lesson. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pathId = searchParams.get("pathId") as PathId | null;
    const lessonId = searchParams.get("lessonId");

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

    const meta = await getLessonMeta(pathId, lessonId.trim());
    if (!meta) {
      return NextResponse.json(
        { error: "Lesson not found in database." },
        { status: 404 },
      );
    }

    const pool = await getQuizzesForLesson(meta.lessonUuid);
    if (pool.length < 10) {
      return NextResponse.json(
        { error: "Quiz not configured (at least 10 questions required)." },
        { status: 404 },
      );
    }

    return NextResponse.json({ questions: pool, poolSize: pool.length });
  } catch (e) {
    console.error("Academy quizzes error:", e);
    return NextResponse.json(
      { error: "Failed to load quiz." },
      { status: 500 },
    );
  }
}
