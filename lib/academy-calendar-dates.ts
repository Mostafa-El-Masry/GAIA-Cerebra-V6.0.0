/**
 * Academy learning calendar dates only (no academy path dependency).
 * Safe for client bundles. Study days Mar 1–Dec 31 2026.
 */

export const CALENDAR_START = "2026-03-01";
export const CALENDAR_END = "2026-12-31";

const FRIDAY = 5;
const SATURDAY = 6;
const SUNDAY = 0;
const MONDAY = 1;

function isStudyDayMarch2026(dayOfWeek: number): boolean {
  return dayOfWeek === FRIDAY;
}

function isStudyDayApril2026(dayOfWeek: number): boolean {
  return dayOfWeek === FRIDAY || dayOfWeek === MONDAY;
}

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
