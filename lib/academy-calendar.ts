/**
 * Academy learning calendar: study days Mar 1–Dec 31 2026 only.
 * Phased weekly rules; lesson rotation by path (Self-Healing → Web Fundamentals → Financial Literacy).
 */

import type { PathId } from "./academy";
import { PATH_IDS } from "./academy";

export const CALENDAR_START = "2026-03-01";
export const CALENDAR_END = "2026-12-31";

const FRIDAY = 5;
const SATURDAY = 6;
const SUNDAY = 0;
const MONDAY = 1;

/** March 2026: 1 day/week = Friday only. */
function isStudyDayMarch2026(dayOfWeek: number): boolean {
  return dayOfWeek === FRIDAY;
}

/** April 2026: 2 days/week = Friday + Monday. */
function isStudyDayApril2026(dayOfWeek: number): boolean {
  return dayOfWeek === FRIDAY || dayOfWeek === MONDAY;
}

/** May 2026 onward: 3 days/week = Friday, Saturday, Sunday. */
function isStudyDayMayOnward(dayOfWeek: number): boolean {
  return dayOfWeek === FRIDAY || dayOfWeek === SATURDAY || dayOfWeek === SUNDAY;
}

function dayOfWeek(iso: string): number {
  const d = new Date(iso + "T12:00:00");
  return d.getDay();
}

function isStudyDay(iso: string): boolean {
  const [y, m] = iso.split("-").map(Number);
  const dow = dayOfWeek(iso);
  if (y === 2026 && m === 3) return isStudyDayMarch2026(dow);
  if (y === 2026 && m === 4) return isStudyDayApril2026(dow);
  if (y === 2026 && m >= 5 && m <= 12) return isStudyDayMayOnward(dow);
  return false;
}

/** All dates in [start, end] that are study days, in chronological order. */
export function getStudyDaysInRange(start: string, end: string): string[] {
  const out: string[] = [];
  const startD = new Date(start + "T00:00:00");
  const endD = new Date(end + "T23:59:59");
  const cur = new Date(startD);
  while (cur <= endD) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${d}`;
    if (isStudyDay(iso)) out.push(iso);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/**
 * Build rotated lesson assignment for each study day.
 * Rotation: Self-Healing → Web Fundamentals → Financial Literacy → repeat.
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
