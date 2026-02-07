import { NextResponse } from "next/server";
import type { PathId } from "@/lib/academy";
import { getLessonMeta, createLessonSession, completeLessonSession, setLessonCompleted } from "@/lib/academy-db";

const VALID_PATH_IDS: PathId[] = [
  "web-fundamentals",
  "financial-literacy",
  "sanctum",
  "self-healing",
];

type Body = {
  pathId?: string;
  lessonId?: string;
  action?: "start" | "complete";
  sessionId?: string;
  durationCompleted?: number;
};

/** POST: start or complete a lesson session. No partial state stored. */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const pathId = body.pathId as PathId | undefined;
    const lessonId = body.lessonId;
    const action = body.action;
    const sessionId = body.sessionId;
    const durationCompleted = body.durationCompleted ?? 0;

    if (!pathId || !lessonId || !action) {
      return NextResponse.json(
        { error: "pathId, lessonId, and action are required." },
        { status: 400 },
      );
    }
    if (!VALID_PATH_IDS.includes(pathId)) {
      return NextResponse.json({ error: "Invalid pathId." }, { status: 400 });
    }

    const slug = String(lessonId).trim();
    const meta = await getLessonMeta(pathId, slug);
    if (!meta) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    if (action === "start") {
      const session = await createLessonSession(meta.lessonUuid, null);
      if (!session) {
        return NextResponse.json(
          { error: "Failed to start session." },
          { status: 500 },
        );
      }
      return NextResponse.json({ sessionId: session.id });
    }

    if (action === "complete") {
      if (!sessionId || typeof durationCompleted !== "number") {
        return NextResponse.json(
          { error: "sessionId and durationCompleted are required for complete." },
          { status: 400 },
        );
      }
      const ok = await completeLessonSession(sessionId, durationCompleted);
      if (!ok) {
        return NextResponse.json(
          { error: "Failed to complete session." },
          { status: 500 },
        );
      }
      if (meta.lessonType === "sanctum") {
        const completed = await setLessonCompleted(pathId, slug);
        if (!completed.ok) {
          return NextResponse.json(
            { error: completed.error ?? "Failed to complete lesson." },
            { status: 500 },
          );
        }
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (e) {
    console.error("Academy session error:", e);
    return NextResponse.json(
      { error: "Failed to process session." },
      { status: 500 },
    );
  }
}
