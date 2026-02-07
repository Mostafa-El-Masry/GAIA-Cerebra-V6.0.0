import { NextResponse } from "next/server";
import type { PathId } from "@/lib/academy";

const VALID_PATH_IDS: PathId[] = [
  "web-fundamentals",
  "financial-literacy",
  "sanctum",
  "self-healing",
];

type Body = { pathId?: string; lessonId?: string; completed?: boolean };

/** POST: rejected. Completion is only via lesson gate (timer + quiz). Use POST /lessons/commit after passing. */
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

    return NextResponse.json(
      { error: "Completion is only possible via the lesson page (timer + quiz). No manual toggle." },
      { status: 400 },
    );
  } catch (e) {
    console.error("Academy complete toggle error:", e);
    return NextResponse.json(
      { error: "Failed to update completion." },
      { status: 500 },
    );
  }
}
