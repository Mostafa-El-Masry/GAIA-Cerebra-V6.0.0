/**
 * File-driven Academy: paths and lessons are read from disk.
 * No hardcoded lesson counts. Completion stored in completed.json.
 */

import fs from "fs";
import path from "path";

/** Lesson files live here (canonical Academy folder). */
const PATHS_DIR = path.join(process.cwd(), "Academy", "lessons");
/** Completion state stays in data/academy so it remains writable. */
const COMPLETED_FILE = path.join(process.cwd(), "data", "academy", "completed.json");
const LAST_VISITED_FILE = path.join(process.cwd(), "data", "academy", "last-visited.json");

export const PATH_IDS = [
  "web-fundamentals",
  "financial-literacy",
] as const;
export type PathId = (typeof PATH_IDS)[number];

const PATH_DISPLAY_NAMES: Record<PathId, string> = {
  "web-fundamentals": "Web Fundamentals",
  "financial-literacy": "Financial Literacy",
};

/** Lesson file extension we consider as lesson files */
const LESSON_EXT = ".md";

function lessonsDir(pathId: PathId): string {
  return path.join(PATHS_DIR, pathId, "lessons");
}

function readCompleted(): Record<string, string[]> {
  try {
    const raw = fs.readFileSync(COMPLETED_FILE, "utf-8");
    const data = JSON.parse(raw) as Record<string, string[]>;
    return data;
  } catch {
    return {};
  }
}

function writeCompleted(data: Record<string, string[]>): void {
  fs.mkdirSync(path.dirname(COMPLETED_FILE), { recursive: true });
  fs.writeFileSync(COMPLETED_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/** List lesson filenames (without extension) in a path's lessons folder. No hardcoded counts. */
export function listLessonIds(pathId: PathId): string[] {
  const dir = lessonsDir(pathId);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  return files
    .filter((f) => path.extname(f).toLowerCase() === LESSON_EXT)
    .map((f) => path.basename(f, LESSON_EXT));
}

/** Get completed lesson ids for a path from the index. */
export function getCompletedIds(pathId: PathId): string[] {
  const data = readCompleted();
  return data[pathId] ?? [];
}

/** Mark a lesson completed (add to index). */
export function markCompleted(pathId: PathId, lessonId: string): void {
  const data = readCompleted();
  const list = data[pathId] ?? [];
  if (!list.includes(lessonId)) {
    data[pathId] = [...list, lessonId];
    writeCompleted(data);
  }
}

/** Remove a lesson from the completed index. */
export function unmarkCompleted(pathId: PathId, lessonId: string): void {
  const data = readCompleted();
  const list = (data[pathId] ?? []).filter((id) => id !== lessonId);
  data[pathId] = list;
  writeCompleted(data);
}

/** Delete a lesson file from disk and remove from completed index. */
export function deleteLesson(pathId: PathId, lessonId: string): boolean {
  const dir = lessonsDir(pathId);
  const filePath = path.join(dir, `${lessonId}${LESSON_EXT}`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  unmarkCompleted(pathId, lessonId);
  return true;
}

/** Read lesson markdown content from disk. Returns null if file does not exist. */
export function getLessonContent(pathId: PathId, lessonId: string): string | null {
  const dir = lessonsDir(pathId);
  const filePath = path.join(dir, `${lessonId}${LESSON_EXT}`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

/** First line of lesson file (e.g. "# Title") stripped to title only. */
export function getLessonTitle(pathId: PathId, lessonId: string): string | null {
  const content = getLessonContent(pathId, lessonId);
  if (!content) return null;
  const firstLine = content.split("\n")[0]?.trim() ?? "";
  return firstLine.replace(/^#+\s*/, "").trim() || null;
}

export function getPathDisplayName(pathId: PathId): string {
  return PATH_DISPLAY_NAMES[pathId];
}

export type LastVisited = { pathId: PathId; lessonId: string; openedAt: string };

function readLastVisited(): LastVisited | null {
  try {
    const raw = fs.readFileSync(LAST_VISITED_FILE, "utf-8");
    return JSON.parse(raw) as LastVisited;
  } catch {
    return null;
  }
}

function writeLastVisited(data: LastVisited): void {
  fs.mkdirSync(path.dirname(LAST_VISITED_FILE), { recursive: true });
  fs.writeFileSync(LAST_VISITED_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/** Get last visited lesson (path, lesson id, timestamp). */
export function getLastVisited(): LastVisited | null {
  return readLastVisited();
}

/** Record that a lesson was opened (last-visited only). Does NOT mark completed — completion is gate-only. */
export function recordLessonOpened(pathId: PathId, lessonId: string): void {
  writeLastVisited({
    pathId,
    lessonId,
    openedAt: new Date().toISOString(),
  });
}

export type PathInfo = {
  id: PathId;
  name: string;
  totalLessons: number;
  completedLessons: number;
  lessons: { id: string; completed: boolean; title?: string | null; requiredMinutes?: number }[];
};

/** Get dashboard data for all paths. All counts from files + index. */
export function getPathsInfo(): PathInfo[] {
  return PATH_IDS.map((id) => {
    const lessonIds = listLessonIds(id);
    const completedIds = getCompletedIds(id);
    const completedSet = new Set(completedIds);
    const lessons = lessonIds.map((lid) => ({
      id: lid,
      completed: completedSet.has(lid),
      title: getLessonTitle(id, lid),
      requiredMinutes: 15,
    }));
    const completedCount = lessons.filter((l) => l.completed).length;
    return {
      id,
      name: PATH_DISPLAY_NAMES[id],
      totalLessons: lessonIds.length,
      completedLessons: completedCount,
      lessons,
    };
  });
}

/** Async: same as getPathsInfo but completion from Supabase only (lesson gate). */
export async function getPathsInfoWithCompletion(): Promise<PathInfo[]> {
  const { getCompletedIdsFromDb } = await import("./academy-db");
  return Promise.all(
    PATH_IDS.map(async (id) => {
      const lessonIds = listLessonIds(id);
      const completedIds = await getCompletedIdsFromDb(id);
      const completedSet = new Set(completedIds);
      const lessons = lessonIds.map((lid) => ({
        id: lid,
        completed: completedSet.has(lid),
        title: getLessonTitle(id, lid),
        requiredMinutes: 15,
      }));
      const completedCount = lessons.filter((l) => l.completed).length;
      return {
        id,
        name: PATH_DISPLAY_NAMES[id],
        totalLessons: lessonIds.length,
        completedLessons: completedCount,
        lessons,
      };
    }),
  );
}
