import { NextResponse } from "next/server";
import { getLessonContent, getPathDisplayName, recordLessonOpened } from "@/lib/academy";
import type { PathId } from "@/lib/academy";
import { getLessonMeta } from "@/lib/academy-db";

const VALID_PATH_IDS: PathId[] = [
  "web-fundamentals",
  "financial-literacy",
  "sanctum",
];

/** GET ?pathId= &lessonId= — returns lesson content + meta (video_url, required_minutes, completed). No auto-complete. */
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

    const slug = lessonId.trim();
    const content = getLessonContent(pathId, slug);
    if (content === null) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 },
      );
    }

    try {
      recordLessonOpened(pathId, slug);
    } catch {
      // Ignore: last-visited write can fail on read-only FS (e.g. Vercel). Lesson content still returned.
    }

    const pathName = getPathDisplayName(pathId);
    let meta: Awaited<ReturnType<typeof getLessonMeta>> = null;
    try {
      meta = await getLessonMeta(pathId, slug);
    } catch {
      // Ignore: DB may be unconfigured or tables missing. Use defaults.
    }
    return NextResponse.json({
      content,
      pathId,
      pathName,
      lessonId: slug,
      videoUrl: meta?.videoUrl ?? null,
      requiredMinutes: meta?.requiredMinutes ?? 15,
      completed: meta?.completed ?? false,
      completedAt: meta?.completedAt ?? null,
      lessonUuid: meta?.lessonUuid ?? null,
      lessonType: meta?.lessonType ?? "learning",
      durationMinutes: meta?.durationMinutes ?? 15,
      allowsReflection: meta?.allowsReflection ?? false,
      allowsAudio: meta?.allowsAudio ?? false,
      allowsVideo: meta?.allowsVideo ?? false,
    });
  } catch (e) {
    console.error("Academy lesson content error:", e);
    return NextResponse.json(
      { error: "Failed to load lesson content." },
      { status: 500 },
    );
  }
}
