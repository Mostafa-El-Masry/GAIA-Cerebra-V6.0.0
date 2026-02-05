import { NextResponse } from "next/server";
import { getLessonContent, getPathDisplayName, recordLessonOpened } from "@/lib/academy";
import type { PathId } from "@/lib/academy";

const VALID_PATH_IDS: PathId[] = [
  "self-healing",
  "web-fundamentals",
  "financial-literacy",
];

/** GET ?pathId= &lessonId= — returns lesson markdown content. */
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

    const content = getLessonContent(pathId, lessonId.trim());
    if (content === null) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 },
      );
    }

    recordLessonOpened(pathId, lessonId.trim());

    const pathName = getPathDisplayName(pathId);
    return NextResponse.json({
      content,
      pathId,
      pathName,
      lessonId: lessonId.trim(),
    });
  } catch (e) {
    console.error("Academy lesson content error:", e);
    return NextResponse.json(
      { error: "Failed to load lesson content." },
      { status: 500 },
    );
  }
}
