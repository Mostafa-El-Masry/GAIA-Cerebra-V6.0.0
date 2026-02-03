"use client";

import TimelineWrapper from "./components/TimelineWrapper";

export default function TimelinePage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-50/80 to-transparent py-10">
      <header className="mx-auto mb-8 max-w-7xl border-b border-gray-200/60 pb-6 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Timeline
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Newest first. Use <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-mono text-xs">j</kbd> / <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-mono text-xs">k</kbd> to move, or jump by era in the sidebar.
        </p>
      </header>
      <div className="w-full">
        <TimelineWrapper />
      </div>
    </main>
  );
}
