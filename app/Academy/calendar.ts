import {
  CALENDAR_END,
  CALENDAR_START,
  getStudyDaysInRange,
} from "@/lib/academy-calendar-dates";

export function isSelfWorkDay(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today < CALENDAR_START || today > CALENDAR_END) return false;
  const days = getStudyDaysInRange(today, today);
  return days.length > 0;
}
