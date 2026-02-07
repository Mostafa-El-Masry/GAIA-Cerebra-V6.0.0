import { NextResponse } from "next/server";
import { deleteLesson, type PathId } from "@/lib/academy";

type DeleteBody = { pathId?: string; lessonId?: string };

/** DELETE: remove lesson file from disk and from completion index. */
export async function DELETE(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as DeleteBody;
    const pathId = body.pathId as PathId | undefined;
    const lessonId = body.lessonId;

    if (!pathId || !lessonId) {
      return NextResponse.json(
        { error: "pathId and lessonId are required." },
        { status: 400 },
      );
    }

    const validPathIds = ["web-fundamentals", "financial-literacy", "sanctum", "self-healing"];
    if (!validPathIds.includes(pathId)) {
      return NextResponse.json(
        { error: "Invalid pathId." },
        { status: 400 },
      );
    }

    const removed = deleteLesson(pathId as PathId, String(lessonId).trim());
    if (!removed) {
      return NextResponse.json(
        { error: "Lesson file not found or could not be deleted." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Academy delete lesson error:", e);
    return NextResponse.json(
      { error: "Failed to delete lesson." },
      { status: 500 },
    );
  }
}
