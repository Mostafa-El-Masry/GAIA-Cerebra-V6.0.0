"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { events as seed, eras } from "../data/events";

type E = (typeof seed)[number];

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function getYearsAgo(ev: E): number {
  if (ev.yearsAgo != null) return ev.yearsAgo;
  return (Date.now() - new Date(ev.date!).getTime()) / MS_PER_YEAR;
}

function byDate(a: E, b: E) {
  return getYearsAgo(a) - getYearsAgo(b); // newest first
}

function formatYearsAgo(y: number): string {
  if (y >= 1e9) return `${(y / 1e9).toFixed(1)} billion years ago`;
  if (y >= 1e6) return `${(y / 1e6).toFixed(0)} million years ago`;
  if (y >= 1e3) return `${(y / 1e3).toFixed(0)} thousand years ago`;
  return `${Math.round(y)} years ago`;
}

function formatDate(ev: E): string {
  if (ev.yearsAgo != null) return formatYearsAgo(ev.yearsAgo);
  const d = new Date(ev.date!);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatEraRange(start: number, end: number): string {
  const fmt = (y: number) => {
    if (y >= 1e9) return `${(y / 1e9).toFixed(1)} Ga`;
    if (y >= 1e6) return `${(y / 1e6).toFixed(0)} Ma`;
    if (y >= 1e3) return `${(y / 1e3).toFixed(0)} ka`;
    if (y <= 0) return "present / future";
    return `${Math.round(y)} yr ago`;
  };
  return `${fmt(start)} → ${fmt(end)}`;
}

function assignEventToEra(ev: E): string {
  const y = getYearsAgo(ev);
  for (const era of eras) {
    if (y <= era.startYearsAgo && y >= era.endYearsAgo) return era.id;
  }
  return eras[eras.length - 1].id;
}

export default function VerticalTimeline() {
  const events = useMemo(() => seed.slice().sort(byDate), []);
  const eventsByEra = useMemo(() => {
    const map: Record<string, E[]> = {};
    for (const era of eras) map[era.id] = [];
    for (const ev of events) {
      const eraId = assignEventToEra(ev);
      map[eraId].push(ev);
    }
    return map;
  }, [events]);
  const [active, setActive] = useState<string | null>(events[0]?.id ?? null);
  const [expandedEra, setExpandedEra] = useState<string | null>(null);
  const mapRef = useRef<Map<string, HTMLDivElement>>(new Map());

  function toggleEra(eraId: string) {
    setExpandedEra((prev) => (prev === eraId ? null : eraId));
  }

  function jump(id: string) {
    setActive(id);
    const el = mapRef.current.get(id);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Keyboard nav (j/k)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!active) return;
      const idx = events.findIndex((ev) => ev.id === active);
      if (e.key === "j" || e.key === "ArrowDown") {
        const next = events[Math.min(events.length - 1, idx + 1)];
        if (next) jump(next.id);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        const prev = events[Math.max(0, idx - 1)];
        if (prev) jump(prev.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, events]);

  return (
    <div className="grid grid-cols-[20rem,1fr] gap-12">
      <aside
        className="scrollbar-match-bg sticky top-16 hidden h-[calc(100vh-6rem)] w-80 shrink-0 flex-col gap-4 overflow-auto rounded-r-2xl border border-l-0 border-gray-200/70 py-5 pl-5 pr-4 shadow-sm backdrop-blur sm:flex"
        style={{ backgroundColor: "var(--gaia-surface)", color: "var(--gaia-text-default)" }}
      >
        <div className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Jump by era
        </div>
        {[...eras].reverse().map((era) => {
          const eraEvents = eventsByEra[era.id];
          if (eraEvents.length === 0) return null;
          const isExpanded = expandedEra === era.id;
          return (
            <div key={era.id} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => toggleEra(era.id)}
                className={`flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-all duration-200 ${
                  isExpanded
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                aria-expanded={isExpanded}
              >
                <span className="min-w-0 break-words">{era.name}</span>
                <span className="shrink-0 text-[10px] text-gray-400">
                  {formatEraRange(era.startYearsAgo, era.endYearsAgo)}
                </span>
              </button>
              {isExpanded &&
                eraEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => jump(ev.id)}
                    className={`rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 break-words ${
                      active === ev.id
                        ? "bg-indigo-50 font-medium text-indigo-800 ring-1 ring-indigo-200/60"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    title={ev.title}
                  >
                    <span className="break-words">{formatDate(ev)} — {ev.title}</span>
                  </button>
                ))}
            </div>
          );
        })}
      </aside>

      <section className="relative pr-4 md:pr-6">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 h-full w-0.5 rounded-full bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200" />
        <ol className="space-y-6">
          {events.map((ev) => {
            const isActive = active === ev.id;
            return (
              <li key={ev.id} id={ev.id}>
                <div
                  ref={(el) => {
                    if (el) mapRef.current.set(ev.id, el);
                  }}
                  className={`relative rounded-xl border bg-white/80 pl-12 pr-5 py-5 shadow-sm transition-all duration-200 ${
                    isActive
                      ? "border-indigo-200/80 bg-indigo-50/30 shadow-md ring-1 ring-indigo-100"
                      : "border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow"
                  }`}
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-0 top-6 h-3 w-3 -translate-x-1/2 rounded-full border-2 ${
                      isActive
                        ? "border-indigo-400 bg-indigo-500 shadow-md shadow-indigo-200/50"
                        : "border-gray-200 bg-white shadow"
                    }`}
                  />
                  <div className="text-xs font-medium tracking-wide text-gray-500 tabular-nums w-[26ch] min-w-[26ch] shrink-0">
                    {formatDate(ev)}
                  </div>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-gray-900">
                    {ev.title}
                  </h3>
                  {ev.description && (
                    <p className="mt-2 leading-relaxed text-gray-600">
                      {ev.description}
                    </p>
                  )}
                  <div className="mt-3 text-[11px] font-mono text-gray-400">
                    {ev.id}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
