/**
 * Academy learning calendar: study days Mar 1–Dec 31 2026 only.
 * Phased weekly rules; lesson rotation by path (Web Fundamentals → Financial Literacy → Sanctum).
 */

import type { PathId } from "./academy";
import { PATH_IDS, getPathDisplayName } from "./academy";
import {
  CALENDAR_START,
  CALENDAR_END,
  getStudyDaysInRange,
} from "./academy-calendar-dates";

export { CALENDAR_START, CALENDAR_END, getStudyDaysInRange };

/** Paths that have lessons plus Sanctum (tool slot, no lesson). */
export type CalendarPathId = PathId | "sanctum";

export type CalendarEntry = {
  date: string;
  pathId: CalendarPathId;
  lessonId: string | null;
};

/** Rotation order: same as other paths — Web Fundamentals → Financial Literacy → Sanctum → repeat. */
const ROTATION_ORDER: CalendarPathId[] = [...PATH_IDS, "sanctum"];

/**
 * Build rotated assignment for each study day.
 * Rotation: Web Fundamentals → Financial Literacy → Sanctum → repeat.
 * One slot per study day; skip path if no lessons left; Sanctum has no lesson (tool day).
 */
export function buildSchedule(
  lessonsByPath: Record<PathId, string[]>,
): CalendarEntry[] {
  const studyDays = getStudyDaysInRange(CALENDAR_START, CALENDAR_END);
  const lessonIdxByPath = new Map<PathId, number>();
  PATH_IDS.forEach((id) => lessonIdxByPath.set(id, 0));
  const result: CalendarEntry[] = [];
  let pathCursor = 0;

  for (const date of studyDays) {
    let attempts = 0;
    while (attempts < ROTATION_ORDER.length) {
      const pathId = ROTATION_ORDER[pathCursor % ROTATION_ORDER.length];
      if (pathId === "sanctum") {
        result.push({ date, pathId: "sanctum", lessonId: null });
        pathCursor++;
        break;
      }
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

/** Display name for calendar path (including Sanctum). */
export function getCalendarPathDisplayName(pathId: CalendarPathId): string {
  if (pathId === "sanctum") return "Sanctum";
  return getPathDisplayName(pathId);
}

/** Parse lesson id like "lesson-01" to "Lesson 01". */
export function formatLessonNumber(lessonId: string): string {
  const match = lessonId.match(/lesson-(\d+)/i);
  if (match) return `Lesson ${match[1].padStart(2, "0")}`;
  return lessonId;
}
