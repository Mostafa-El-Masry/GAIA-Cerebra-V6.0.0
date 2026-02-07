import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import type { PathId } from "@/lib/academy";
import { getLessonMeta, saveReflection } from "@/lib/academy-db";
import type { ReflectionType } from "@/lib/academy-db";

const VALID_PATH_IDS: PathId[] = [
  "web-fundamentals",
  "financial-literacy",
  "sanctum",
  "self-healing",
];

const LOCAL_REFLECTIONS = "local-reflections";

/** POST: save a lesson reflection (text, voice transcript, or video metadata). Optional; does not affect completion. */
export async function POST(req: Request) {
  try {
    const formData = await req.formData().catch(() => null);
    const pathId = (formData?.get("pathId") ?? req.headers.get("x-path-id")) as string | null;
    const lessonId = (formData?.get("lessonId") ?? req.headers.get("x-lesson-id")) as string | null;
    const type = (formData?.get("type") ?? req.headers.get("x-type")) as string | null;
    const content = (formData?.get("content") as string | null) ?? null;
    const file = formData?.get("file") as File | null;

    if (!pathId || !lessonId || !type) {
      return NextResponse.json(
        { error: "pathId, lessonId, and type are required." },
        { status: 400 },
      );
    }
    if (!VALID_PATH_IDS.includes(pathId as PathId)) {
      return NextResponse.json({ error: "Invalid pathId." }, { status: 400 });
    }
    if (!["text", "voice", "video"].includes(type)) {
      return NextResponse.json({ error: "type must be text, voice, or video." }, { status: 400 });
    }

    const slug = String(lessonId).trim();
    const meta = await getLessonMeta(pathId as PathId, slug);
    if (!meta) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    let localPath: string | null = null;

    if ((type === "voice" || type === "video") && file && file.size > 0) {
      const dir = type === "voice" ? path.join(LOCAL_REFLECTIONS, "audio") : path.join(LOCAL_REFLECTIONS, "video");
      const root = process.cwd();
      const dirAbs = path.join(root, dir);
      fs.mkdirSync(dirAbs, { recursive: true });
      const ext = type === "video" ? "webm" : "webm";
      const name = `${meta.lessonUuid}-${Date.now()}.${ext}`;
      const filePath = path.join(dirAbs, name);
      const buf = new Uint8Array(await file.arrayBuffer());
      fs.writeFileSync(filePath, buf);
      localPath = path.join(dir, name);
    }

    const result = await saveReflection(
      meta.lessonUuid,
      null,
      type as ReflectionType,
      content ?? null,
      localPath,
    );
    if (!result) {
      return NextResponse.json(
        { error: "Failed to save reflection." },
        { status: 500 },
      );
    }
    return NextResponse.json({ id: result.id });
  } catch (e) {
    console.error("Academy reflections error:", e);
    return NextResponse.json(
      { error: "Failed to save reflection." },
      { status: 500 },
    );
  }
}
