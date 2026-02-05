"use client";

import { useCallback, useEffect, useState } from "react";
import LearningCalendar from "../components/LearningCalendar";
import type { CalendarEntry } from "../components/LearningCalendar";

/** Learning calendar (Mar 1–Dec 31 2026). Used by Academy page and by dashboard calendars hub. */
export default function AcademyCalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  const fetchCalendar = useCallback(async () => {
    try {
      const [calRes, dashRes] = await Promise.all([
        fetch("/api/apollo/academy/calendar?start=2026-03-01&end=2026-12-31"),
        fetch("/api/apollo/academy/dashboard"),
      ]);
      if (calRes.ok) {
        const data = (await calRes.json()) as { entries: CalendarEntry[] };
        setEntries(data.entries ?? []);
      }
      if (dashRes.ok) {
        const dash = (await dashRes.json()) as {
          currentScheduled?: { date: string } | null;
        };
        setCurrentDate(dash.currentScheduled?.date ?? null);
      }
    } catch {
      setEntries([]);
      setCurrentDate(null);
    }
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return (
    <div className="w-full">
      <LearningCalendar
        entries={entries}
        currentScheduledDate={currentDate}
        onRefresh={fetchCalendar}
      />
    </div>
  );
}
