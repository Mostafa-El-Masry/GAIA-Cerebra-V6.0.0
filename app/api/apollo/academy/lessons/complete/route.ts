import { NextResponse } from "next/server";
import { markCompleted, unmarkCompleted, type PathId } from "@/lib/academy";

const VALID_PATH_IDS: PathId[] = [
  "self-healing",
  "web-fundamentals",
  "financial-literacy",
];

type Body = { pathId?: string; lessonId?: string; completed?: boolean };

/** POST: set completion state for a lesson (updates index only). */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const pathId = body.pathId as PathId | undefined;
    const lessonId = body.lessonId;
    const completed = Boolean(body.completed);

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

    if (completed) {
      markCompleted(pathId, String(lessonId).trim());
    } else {
      unmarkCompleted(pathId, String(lessonId).trim());
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Academy complete toggle error:", e);
    return NextResponse.json(
      { error: "Failed to update completion." },
      { status: 500 },
    );
  }
}
