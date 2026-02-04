"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getPlanDefinitions, buildLevelsSnapshot } from "../lib/levels";
import { loadWealthStateWithRemote } from "../lib/wealthStore";
import { buildWealthOverview, getTodayInKuwait } from "../lib/summary";
import { getExchangeRate } from "../lib/exchangeRate";
import type { WealthLevelDefinition } from "../lib/types";
import type { WealthLevelsSnapshot } from "../lib/types";

const surface = "wealth-surface text-[var(--gaia-text-default)]";
const PLAN_CURRENCY = "EGP";
const PLAN_LETTERS = "JIHGFEDCBA"; // order 1 -> J, 2 -> I, ... 10 -> A

function getPlanLetter(plan: WealthLevelDefinition): string {
  const idx = plan.order - 1;
  return idx >= 0 && idx < PLAN_LETTERS.length ? PLAN_LETTERS[idx]! : plan.id;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Progress 0..1 toward a plan's milestones (savings + revenue). */
function getPhaseProgress(
  phase: PhaseData,
  totalSavings: number,
  monthlyRevenue: number,
  snapshot: WealthLevelsSnapshot | null,
): number {
  if (!phase.planTarget) {
    if (phase.isFinalPhase && snapshot) {
      const allAchieved = snapshot.nextLevelId === null;
      return allAchieved ? 1 : 0;
    }
    return 0;
  }
  const currentPlan = snapshot?.levels.find(
    (l) => l.id === snapshot.currentLevelId,
  );
  const currentOrder = currentPlan?.order ?? 0;
  if (phase.planTarget.order < currentOrder) return 1;
  const savingsTarget = phase.planTarget.minSavings ?? 0;
  const revenueTarget = phase.planTarget.minMonthlyRevenue ?? 0;
  if (savingsTarget <= 0 && revenueTarget <= 0) return 0;
  const savingsProgress =
    savingsTarget > 0 ? Math.min(1, totalSavings / savingsTarget) : 1;
  const revenueProgress =
    revenueTarget > 0 ? Math.min(1, monthlyRevenue / revenueTarget) : 1;
  return Math.min(savingsProgress, revenueProgress);
}

function formatNumEgp(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
}

function PhaseProgressBar({
  progress,
  completed,
  remainingSavingsEgp,
  remainingRevenueEgp,
  delayMs = 0,
}: {
  progress: number;
  completed?: boolean;
  remainingSavingsEgp?: number | null;
  remainingRevenueEgp?: number | null;
  delayMs?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  const pct = Math.min(100, Math.max(0, progress * 100));
  const width = mounted ? pct : 0;
  const saveRem = remainingSavingsEgp != null && Number.isFinite(remainingSavingsEgp) && remainingSavingsEgp > 0 ? remainingSavingsEgp : null;
  const revRem = remainingRevenueEgp != null && Number.isFinite(remainingRevenueEgp) && remainingRevenueEgp > 0 ? remainingRevenueEgp : null;
  const remainingLabel = completed
    ? "Completed"
    : saveRem != null
      ? `${formatNumEgp(saveRem)} EGP to save`
      : revRem != null
        ? `${formatNumEgp(revRem)} EGP revenue remaining`
        : "Toward milestones";
  return (
    <div className="w-full mt-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-10 w-full rounded-lg bg-[var(--gaia-ink-faint)] overflow-hidden relative flex items-center">
        <div
          className="absolute inset-y-0 left-0 rounded-lg transition-[width] duration-700 ease-out"
          style={{
            width: `${width}%`,
            background: completed
              ? "linear-gradient(90deg, var(--gaia-positive) 0%, var(--gaia-positive) 100%)"
              : "linear-gradient(90deg, var(--gaia-accent, #3b82f6) 0%, var(--gaia-accent, #60a5fa) 100%)",
            boxShadow: completed ? "0 0 8px var(--gaia-positive)" : "none",
          }}
        />
        <div className="relative z-10 w-full flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 px-3 py-1.5 text-center">
          <span className="text-sm font-bold tabular-nums text-[var(--gaia-text-strong)] drop-shadow-sm">
            {Math.round(pct)}%
          </span>
          <span className={`text-xs font-medium ${completed ? "text-[var(--gaia-text-strong)]" : "text-[var(--gaia-text-default)]"}`}>
            {remainingLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

type PhaseData = {
  phaseNumber: number;
  title: string;
  /** Single plan target for this phase (the one you're completing). */
  planTarget: WealthLevelDefinition | null;
  /** Single condition for this phase (from the plan just completed; null for Phase 1). */
  condition: WealthLevelDefinition | null;
  isFinalPhase: boolean;
};

function buildPhases(plans: WealthLevelDefinition[]): PhaseData[] {
  const phases: PhaseData[] = [];
  for (let i = 0; i < 11; i++) {
    const phaseNumber = i + 1;
    const planTarget = plans[i] ?? null;
    const condition = i > 0 ? plans[i - 1] ?? null : null;
    const isFinalPhase = i === 10;

    let title: string;
    if (i === 0) {
      title = `PHASE 1 — PLAN ${getPlanLetter(plans[0]!)}`;
    } else if (i === 1) {
      title = `PHASE 2 — PLAN ${getPlanLetter(plans[0]!)} (completed) + PLAN ${getPlanLetter(plans[1]!)} (financial only)`;
    } else if (i < 10 && plans[i - 1] && plans[i]) {
      title = `PHASE ${phaseNumber} — PLAN ${getPlanLetter(plans[i - 1]!)} (active) + PLAN ${getPlanLetter(plans[i]!)} (financial only)`;
    } else if (i === 9) {
      title = `PHASE 10 — PLAN ${getPlanLetter(plans[8]!)} (active) + PLAN ${getPlanLetter(plans[9]!)} (financial only)`;
    } else {
      title = "PHASE 11 — PLAN A (FINAL STATE)";
    }

    phases.push({
      phaseNumber,
      title,
      planTarget,
      condition,
      isFinalPhase,
    });
  }
  return phases;
}

export default function PhasesPage() {
  const planDefinitions = useMemo(() => getPlanDefinitions(), []);
  const phases = useMemo(() => buildPhases(planDefinitions), [planDefinitions]);
  const [snapshot, setSnapshot] = useState<WealthLevelsSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [state, fxInfo] = await Promise.all([
        loadWealthStateWithRemote(),
        getExchangeRate(),
      ]);
      if (cancelled) return;
      const today = getTodayInKuwait();
      const overview = buildWealthOverview(state, today);
      const snap = buildLevelsSnapshot(overview, {
        planCurrency: PLAN_CURRENCY,
        fxRate: fxInfo?.rate ?? undefined,
      });
      setSnapshot(snap);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalSavings = snapshot?.totalSavings ?? 0;
  const monthlyRevenue = snapshot?.monthlyPassiveIncome ?? 0;

  const [expandedPhases, setExpandedPhases] = useState<boolean[]>(
    new Array(11).fill(false),
  );

  const togglePhase = (index: number) => {
    setExpandedPhases((prev) =>
      prev.map((expanded, i) => (i === index ? !expanded : expanded)),
    );
  };

  return (
    <main className="mx-auto max-w-6xl w-full space-y-6 px-4 py-6 text-[var(--gaia-text-default)] sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between pb-4 lg:pb-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            Wealth
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[var(--gaia-text-strong)]">
            Phases
          </h1>
          <p className="mt-2 max-w-3xl text-sm gaia-muted">
            One plan target and one condition per phase. Expand a phase for
            details.
          </p>
        </div>
      </header>

      <section className={`${surface} space-y-4 p-4 sm:p-5 md:p-6 border-0 rounded-none`}>
        <div className="space-y-3">
          {phases.map((phase, index) => (
            <div
              key={phase.phaseNumber}
              className="bg-[var(--gaia-surface)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => togglePhase(index)}
                className="w-full text-left px-4 py-4 transition-colors hover:bg-[var(--gaia-surface-soft)] flex flex-col items-stretch gap-0 sm:px-5"
              >
                <div className="flex items-center gap-2">
                  {expandedPhases[index] ? (
                    <ChevronDown className="w-5 h-5 text-[var(--gaia-text-muted)] shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[var(--gaia-text-muted)] shrink-0" />
                  )}
                  <span className="text-base font-semibold text-[var(--gaia-text-strong)]">
                    {phase.title}
                  </span>
                </div>
                <PhaseProgressBar
                  progress={getPhaseProgress(
                    phase,
                    totalSavings,
                    monthlyRevenue,
                    snapshot,
                  )}
                  completed={
                    (phase.planTarget &&
                      (snapshot?.levels.find(
                        (l) => l.id === snapshot.currentLevelId,
                      )?.order ?? 0) > phase.planTarget.order) ||
                    (phase.isFinalPhase && snapshot?.nextLevelId === null)
                  }
                  remainingSavingsEgp={
                    phase.planTarget?.minSavings != null
                      ? Math.max(0, phase.planTarget.minSavings - totalSavings)
                      : null
                  }
                  remainingRevenueEgp={
                    phase.planTarget?.minMonthlyRevenue != null
                      ? Math.max(0, phase.planTarget.minMonthlyRevenue - monthlyRevenue)
                      : null
                  }
                  delayMs={index * 80}
                />
              </button>
              {expandedPhases[index] && (
                <div className="px-4 pb-5 pt-4 sm:px-5 md:px-6">
                  {/* Plan target — full width, then Condition below */}
                  <div className="space-y-5">
                    <div className="bg-[var(--gaia-surface-soft)] p-4 sm:p-5">
                      <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)] mb-2">
                        Plan target
                      </h3>
                      {phase.planTarget ? (
                        <>
                          <p className="text-sm font-medium text-[var(--gaia-text-strong)]">
                            PLAN {getPlanLetter(phase.planTarget)} —{" "}
                            {phase.planTarget.shortLabel}
                          </p>
                          {phase.planTarget.project && (
                            <p className="mt-1 text-sm text-[var(--gaia-text-default)]">
                              Project: {phase.planTarget.project}
                            </p>
                          )}
                          <dl className="mt-2 space-y-1 text-sm text-[var(--gaia-text-default)]">
                            {phase.planTarget.minSavings != null && (
                              <div>
                                Min savings:{" "}
                                {formatCurrency(phase.planTarget.minSavings)}{" "}
                                EGP
                              </div>
                            )}
                            {phase.planTarget.minMonthlyRevenue != null && (
                              <div>
                                Min monthly revenue:{" "}
                                {formatCurrency(
                                  phase.planTarget.minMonthlyRevenue,
                                )}{" "}
                                EGP
                              </div>
                            )}
                          </dl>
                          <p className="mt-3 text-xs text-[var(--gaia-text-muted)]">
                            <a href="/wealth/plans" className="underline hover:text-[var(--gaia-text-default)]">
                              View wealth projection table on Plans page →
                            </a>
                          </p>
                        </>
                      ) : phase.isFinalPhase ? (
                        <p className="text-sm text-[var(--gaia-text-default)]">
                          All plans achieved. Final state.
                        </p>
                      ) : null}
                    </div>

                    {/* Condition — full width below Plan target */}
                    <div className="bg-[var(--gaia-surface-soft)] p-4 sm:p-5">
                      <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)] mb-2">
                        Condition
                      </h3>
                      {phase.condition ? (
                        <>
                          <p className="text-sm font-medium text-[var(--gaia-text-strong)]">
                            PLAN {getPlanLetter(phase.condition)} —{" "}
                            {phase.condition.shortLabel}
                          </p>
                          {phase.condition.project && (
                            <p className="mt-1 text-sm text-[var(--gaia-text-default)]">
                              Project: {phase.condition.project}
                            </p>
                          )}
                          <dl className="mt-2 space-y-1 text-sm text-[var(--gaia-text-default)]">
                            {phase.condition.survivability != null && (
                              <div>Survivability: {phase.condition.survivability}</div>
                            )}
                            {phase.condition.allowedEnrichment != null && (
                              <div>
                                Allowed enrichment:{" "}
                                {phase.condition.allowedEnrichment}
                              </div>
                            )}
                            {phase.condition.calendarsUnlocked != null && (
                              <div>
                                Calendars unlocked:{" "}
                                {phase.condition.calendarsUnlocked}
                              </div>
                            )}
                          </dl>
                        </>
                      ) : (
                        <p className="text-sm text-[var(--gaia-text-muted)]">
                          None yet (first phase).
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phase ends when / Final state */}
                  <div className="mt-5 pt-4">
                    {phase.isFinalPhase ? (
                      <p className="text-sm font-medium text-[var(--gaia-text-strong)]">
                        Final state: all plans achieved. Money is insulation;
                        habits and calendars are embodied.
                      </p>
                    ) : phase.planTarget ? (
                      <p className="text-sm font-medium text-[var(--gaia-text-strong)]">
                        Phase {phase.phaseNumber} ends when: Savings ≥{" "}
                        {formatCurrency(phase.planTarget.minSavings ?? 0)} EGP,
                        Monthly revenue ≥{" "}
                        {formatCurrency(
                          phase.planTarget.minMonthlyRevenue ?? 0,
                        )}{" "}
                        EGP
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
