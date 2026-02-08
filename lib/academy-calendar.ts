/**
 * Academy learning calendar: study days Mar 1–Dec 31 2026 only.
 * Phased weekly rules; lesson rotation by path (Web Fundamentals → Financial Literacy → Sanctum).
 */

import type { PathId } from "./academy";
import { PATH_IDS } from "./academy";
import {
  CALENDAR_START,
  CALENDAR_END,
  getStudyDaysInRange,
} from "./academy-calendar-dates";

export { CALENDAR_START, CALENDAR_END, getStudyDaysInRange };

/**
 * Build rotated lesson assignment for each study day.
 * Rotation: Web Fundamentals → Financial Literacy → Sanctum → repeat.
 * One lesson per study day; skip path if no lessons left; don't repeat same path twice in a row if others have lessons.
 */
export function buildSchedule(
  lessonsByPath: Record<PathId, string[]>,
): Array<{ date: string; pathId: PathId; lessonId: string }> {
  const studyDays = getStudyDaysInRange(CALENDAR_START, CALENDAR_END);
  const pathOrder = [...PATH_IDS];
  const lessonIdxByPath = new Map<PathId, number>();
  PATH_IDS.forEach((id) => lessonIdxByPath.set(id, 0));
  const result: Array<{ date: string; pathId: PathId; lessonId: string }> = [];
  let pathCursor = 0;

  for (const date of studyDays) {
    let attempts = 0;
    while (attempts < pathOrder.length) {
      const pathId = pathOrder[pathCursor % pathOrder.length];
      const lessons = lessonsByPath[pathId] ?? [];
      const idx = lessonIdxByPath.get(pathId) ?? 0;
      if (idx < lessons.length) {
        result.push({ date, pathId, lessonId: lessons[idx] });
        lessonIdxByPath.set(pathId, idx + 1);
        pathCursor++;
        break;
      }
      pathCursor++;
      attempts++;
    }
  }
  return result;
}

/** Parse lesson id like "lesson-01" to "Lesson 01". */
export function formatLessonNumber(lessonId: string): string {
  const match = lessonId.match(/lesson-(\d+)/i);
  if (match) return `Lesson ${match[1].padStart(2, "0")}`;
  return lessonId;
}
