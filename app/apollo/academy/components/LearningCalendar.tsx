"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gaia-learning-calendar-view";

export type CalendarEntry = {
  date: string;
  pathId: string;
  lessonId: string;
  pathName: string;
  lessonNumber: string;
  title: string | null;
  status: "completed" | "incomplete";
};

type Props = {
  entries: CalendarEntry[];
  currentScheduledDate: string | null;
  onRefresh?: () => void;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS_2026 = [
  "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Build weeks (Sun–Sat) for a single month. monthIndex 0 = Mar, 1 = Apr, … 9 = Dec. */
function buildWeeksForMonth(monthIndex: number): string[][] {
  const month = monthIndex + 3; // 3=Mar … 12=Dec
  const firstDay = new Date(2026, month - 1, 1);
  const lastDay = new Date(2026, month, 0);
  const startOfWeek = new Date(firstDay);
  startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());
  const endOfWeek = new Date(lastDay);
  endOfWeek.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
  const weeks: string[][] = [];
  const cur = new Date(startOfWeek);
  while (cur <= endOfWeek) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      week.push(`${y}-${m}-${d}`);
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function isInViewingMonth(iso: string, monthIndex: number): boolean {
  const d = new Date(iso + "T12:00:00");
  const targetMonth = monthIndex + 3; // Mar=3 … Dec=12
  return d.getFullYear() === 2026 && d.getMonth() + 1 === targetMonth;
}

const CALENDAR_START = "2026-03-01";
const CALENDAR_END = "2026-12-31";

function inRange(iso: string): boolean {
  return iso >= CALENDAR_START && iso <= CALENDAR_END;
}

function firstDayOfMonth(monthIndex: number): string {
  const month = monthIndex + 3; // Mar=3, Apr=4, ... Dec=12
  const m = String(month).padStart(2, "0");
  return `2026-${m}-01`;
}

export default function LearningCalendar({
  entries,
  currentScheduledDate,
}: Props) {
  const entryByDate = useMemo(
    () => Object.fromEntries(entries.map((e) => [e.date, e])),
    [entries],
  );

  const defaultSelected = useMemo(() => {
    if (currentScheduledDate && inRange(currentScheduledDate)) return currentScheduledDate;
    const first = entries[0]?.date;
    if (first) return first;
    return CALENDAR_START;
  }, [currentScheduledDate, entries]);

  const defaultViewingMonth = useMemo(() => {
    const d = new Date(defaultSelected + "T12:00:00");
    const m = d.getMonth();
    return m >= 2 ? m - 2 : 0; // Mar=0 … Dec=9
  }, [defaultSelected]);

  const [selectedDate, setSelectedDate] = useState<string | null>(defaultSelected);
  const [viewingMonthIndex, setViewingMonthIndex] = useState(defaultViewingMonth);

  // Restore last-viewed month and selected date from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { viewingMonthIndex?: number; selectedDate?: string };
      const idx = Number(parsed.viewingMonthIndex);
      const date = typeof parsed.selectedDate === "string" ? parsed.selectedDate : null;
      if (Number.isFinite(idx) && idx >= 0 && idx <= 9) {
        setViewingMonthIndex(idx);
        if (date && inRange(date)) setSelectedDate(date);
        else setSelectedDate(firstDayOfMonth(idx));
      }
    } catch {
      // ignore invalid stored data
    }
  }, []);

  // Persist view when month or selected date changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          viewingMonthIndex,
          selectedDate: selectedDate ?? firstDayOfMonth(viewingMonthIndex),
        }),
      );
    } catch {
      // ignore quota / private mode
    }
  }, [viewingMonthIndex, selectedDate]);

  const weeks = useMemo(
    () => buildWeeksForMonth(viewingMonthIndex),
    [viewingMonthIndex],
  );

  const selectedEntry = selectedDate ? entryByDate[selectedDate] ?? null : null;
  const monthIndexForSelected = viewingMonthIndex;

  const goToMonth = useCallback((index: number) => {
    setViewingMonthIndex(index);
    setSelectedDate(firstDayOfMonth(index));
  }, []);

  const goToToday = useCallback(() => {
    const date = currentScheduledDate && inRange(currentScheduledDate)
      ? currentScheduledDate
      : CALENDAR_START;
    setSelectedDate(date);
    const d = new Date(date + "T12:00:00");
    const m = d.getMonth();
    setViewingMonthIndex(m >= 2 ? m - 2 : 0);
  }, [currentScheduledDate]);

  const viewingMonthLabel = useMemo(() => {
    const month = viewingMonthIndex + 3;
    const d = new Date(2026, month - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [viewingMonthIndex]);

  const goToPrevMonth = useCallback(() => {
    if (viewingMonthIndex <= 0) return;
    setViewingMonthIndex((i) => i - 1);
    setSelectedDate(firstDayOfMonth(viewingMonthIndex - 1));
  }, [viewingMonthIndex]);

  const goToNextMonth = useCallback(() => {
    if (viewingMonthIndex >= 9) return;
    setViewingMonthIndex((i) => i + 1);
    setSelectedDate(firstDayOfMonth(viewingMonthIndex + 1));
  }, [viewingMonthIndex]);

  const formatDayHeader = (iso: string) => {
    const d = new Date(iso + "T12:00:00");
    const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
    const day = d.getDate();
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    return { month, day, weekday };
  };

  return (
    <div className="rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-4 shadow-sm md:p-6 text-[var(--gaia-text-default)]">
      {/* Top bar: Today + Calendar label (reference-style tabs) */}
      <div className="mb-4 flex items-center justify-between border-b border-[var(--gaia-border)] pb-3">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={goToToday}
            className="text-base font-medium text-[var(--gaia-text-default)] transition hover:text-[var(--gaia-text-strong)]"
          >
            Today
          </button>
          <span className="text-base font-semibold text-[var(--gaia-text-strong)] border-b-2 border-[var(--gaia-positive)] pb-0.5">
            Calendar
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left: Year + month list */}
        <aside className="flex shrink-0 flex-row gap-6 border-b border-[var(--gaia-border)] pb-4 lg:w-24 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gaia-text-muted)]">
            2026
          </p>
          <nav className="flex gap-2 lg:flex-col">
            {MONTHS_2026.map((label, index) => {
              const isActive = index === monthIndexForSelected;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => goToMonth(index)}
                  className={`text-left text-base font-medium transition ${
                    isActive
                      ? "text-[var(--gaia-positive)]"
                      : "text-[var(--gaia-text-default)] hover:text-[var(--gaia-text-strong)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Center: Calendar grid */}
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--gaia-text-strong)]">
              {viewingMonthLabel}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToPrevMonth}
                disabled={viewingMonthIndex <= 0}
                className="rounded-md p-1.5 text-[var(--gaia-text-muted)] transition hover:bg-[var(--gaia-surface-soft)] hover:text-[var(--gaia-text-strong)] disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                disabled={viewingMonthIndex >= 9}
                className="rounded-md p-1.5 text-[var(--gaia-text-muted)] transition hover:bg-[var(--gaia-surface-soft)] hover:text-[var(--gaia-text-strong)] disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>
          <table className="w-full min-w-[420px] table-fixed border-collapse text-base">
            <colgroup>
              {WEEKDAY_LABELS.map((_, i) => (
                <col key={i} style={{ width: "14.2857%" }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {WEEKDAY_LABELS.map((label) => (
                  <th
                    key={label}
                    className="h-10 border-b border-[var(--gaia-border)] py-2 text-center text-xs font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi} className="border-b border-[var(--gaia-border)] last:border-b-0">
                  {week.map((dateIso) => {
                    const inRangeOk = inRange(dateIso);
                    const entry = inRangeOk ? entryByDate[dateIso] : null;
                    const isSelected = selectedDate === dateIso;
                    const inViewingMonth = isInViewingMonth(dateIso, viewingMonthIndex);
                    const d = new Date(dateIso + "T12:00:00");
                    const dayNum = d.getDate();

                    const handleDayClick = () => {
                      setSelectedDate(dateIso);
                      if (!inViewingMonth) {
                        const m = d.getMonth();
                        setViewingMonthIndex(m >= 2 ? m - 2 : 0);
                      }
                    };

                    if (!inRangeOk) {
                      return (
                        <td
                          key={dateIso}
                          className="h-[10.5rem] min-h-[10.5rem] border-r border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)]/40 align-middle text-center last:border-r-0"
                        />
                      );
                    }

                    return (
                      <td
                        key={dateIso}
                        className={`h-[10.5rem] min-h-[10.5rem] border-r border-[var(--gaia-border)] align-middle text-center last:border-r-0 ${
                          !inViewingMonth ? "bg-[var(--gaia-surface-soft)]/30" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={handleDayClick}
                          className={`flex h-full w-full flex-col items-center justify-center rounded-md px-0.5 py-1 transition ${
                            entry
                              ? entry.status === "completed"
                                ? isSelected
                                  ? "bg-[var(--gaia-positive)] text-[var(--gaia-contrast-text)]"
                                  : "bg-[var(--gaia-positive-bg)] text-[var(--gaia-positive)] hover:bg-[var(--gaia-positive)]/20"
                                : isSelected
                                  ? "bg-red-600 text-white"
                                  : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                              : isSelected
                                ? "bg-[var(--gaia-positive)] text-[var(--gaia-contrast-text)]"
                                : inViewingMonth
                                  ? "text-[var(--gaia-text-strong)] hover:bg-[var(--gaia-surface-soft)]"
                                  : "text-[var(--gaia-text-muted)] hover:bg-[var(--gaia-surface-soft)]/70"
                          }`}
                        >
                          <span className="text-sm font-medium leading-tight">{dayNum}</span>
                          {entry && (
                            <>
                              <span
                                className={`mt-0.5 max-w-full truncate text-[11px] leading-tight ${
                                  isSelected && entry.status === "completed"
                                    ? "text-[var(--gaia-contrast-text)]/90"
                                    : isSelected && entry.status === "incomplete"
                                      ? "text-white/90"
                                      : "text-[var(--gaia-text-muted)]"
                                }`}
                                title={entry.pathName}
                              >
                                {entry.pathName}
                              </span>
                              <span
                                className={`max-w-full truncate text-[10px] leading-tight ${
                                  isSelected && entry.status === "completed"
                                    ? "text-[var(--gaia-contrast-text)]/80"
                                    : isSelected && entry.status === "incomplete"
                                      ? "text-white/80"
                                      : "text-[var(--gaia-text-muted)]"
                                }`}
                                title={entry.title ?? entry.lessonNumber}
                              >
                                {entry.title ?? entry.lessonNumber}
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Selected day events */}
        <aside className="w-full shrink-0 border-t border-[var(--gaia-border)] pt-4 lg:w-56 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          {selectedDate && inRange(selectedDate) ? (
            <>
              <div className="mb-3">
                <p className="text-xl font-bold uppercase tracking-wide text-[var(--gaia-positive)]">
                  {formatDayHeader(selectedDate).month} {formatDayHeader(selectedDate).day}
                </p>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]">
                  {formatDayHeader(selectedDate).weekday}
                </p>
              </div>
              <div className="space-y-2">
                {selectedEntry ? (
                  <Link
                    href={`/apollo/academy/lesson/${selectedEntry.pathId}/${selectedEntry.lessonId}`}
                    className="block rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-3 transition hover:border-[var(--gaia-positive)]/50"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gaia-text-muted)]">
                      {selectedEntry.pathName}
                    </p>
                    <p className="mt-1 text-base font-semibold text-[var(--gaia-text-strong)]">
                      {selectedEntry.lessonNumber}
                      {selectedEntry.title && (
                        <span className="font-normal text-[var(--gaia-text-default)]">
                          {" — "}{selectedEntry.title}
                        </span>
                      )}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${
                        selectedEntry.status === "completed"
                          ? "border-[var(--gaia-positive-border)] bg-[var(--gaia-positive-bg)] text-[var(--gaia-positive)]"
                          : "border-[var(--gaia-border)] text-[var(--gaia-text-muted)]"
                      }`}
                    >
                      {selectedEntry.status === "completed" ? "Completed" : "Incomplete"}
                    </span>
                  </Link>
                ) : (
                  <p className="text-sm text-[var(--gaia-text-muted)]">
                    No lesson scheduled
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--gaia-text-muted)]">
              Select a day
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
