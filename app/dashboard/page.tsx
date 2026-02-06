"use client";

import TodoDaily from "./components/TodoDaily";
import TodayLearning from "./widgets/TodayLearning";
import WealthSpark from "./widgets/WealthSpark";

/**
 * Dashboard Page
 * Shows daily todos - one task per category (life, work, distraction) for today
 */
export default function DashboardPage() {
  return (
    <main className="min-h-screen gaia-surface">
      <div className="fixed left-4 top-4 z-40 [left:max(1rem,env(safe-area-inset-left))] [top:max(1rem,env(safe-area-inset-top))]">
        <a
          href="/"
          className="touch-target gaia-glass-strong gaia-border inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
        >
          ⟵ GAIA
        </a>
      </div>

      <div className="mx-auto max-w-6xl space-y-4 p-4 pt-20 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))] [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-wide text-[var(--gaia-text-strong)]">Dashboard</h1>
          <a
            href="/dashboard/calendars"
            className="gaia-glass-strong gaia-border inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-[var(--gaia-text-default)] hover:opacity-90"
          >
            Calendars →
          </a>
        </div>

        <TodoDaily />

        <section className="gaia-glass-strong gaia-border rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--gaia-text-default)]">
            Today&apos;s learning
          </h2>
          <TodayLearning />
        </section>

        <section className="gaia-glass-strong gaia-border rounded-lg border p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--gaia-text-default)]">Wealth</h2>
          <WealthSpark />
        </section>
      </div>
    </main>
  );
}
