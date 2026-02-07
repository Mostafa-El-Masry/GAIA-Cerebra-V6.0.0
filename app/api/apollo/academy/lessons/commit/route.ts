import { NextResponse } from "next/server";
import type { PathId } from "@/lib/academy";
import { setLessonCompleted } from "@/lib/academy-db";

const VALID_PATH_IDS: PathId[] = [
  "self-healing",
  "web-fundamentals",
  "financial-literacy",
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
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Academy commit completion error:", e);
    return NextResponse.json(
      { error: "Failed to commit completion." },
      { status: 500 },
    );
  }
}
