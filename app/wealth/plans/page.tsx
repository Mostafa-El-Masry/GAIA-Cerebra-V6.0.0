"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type {
  WealthState,
  WealthLevelsSnapshot,
  WealthLevelDefinition,
  WealthInstrument,
} from "../lib/types";
import { loadWealthStateWithRemote } from "../lib/wealthStore";
import { buildWealthOverview, getTodayInKuwait } from "../lib/summary";
import { buildLevelsSnapshot, getPlanDefinitions } from "../lib/levels";
import { getExchangeRate } from "../lib/exchangeRate";
import {
  buildPlanProjectionRows,
  estimatePlanTargetYear,
  type PlanProjectionRow,
} from "../lib/planProjection";
import { PlanProjectionTable } from "../components/PlanProjectionTable";
import {
  loadRates,
  saveRates,
  YearRate,
} from "../lib/bankRates";

const surface = "wealth-surface text-[var(--gaia-text-default)]";
const BIRTH_DATE_UTC = new Date(Date.UTC(1991, 7, 10));
const BANK_RATE_BASE_YEAR = 2025;
const BANK_RATE_BASE_PERCENT = 17;
const MIN_ANNUAL_RATE = 10;

function calculateAge(today: Date, birthDate: Date): number {
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const hasBirthdayPassed =
    today.getUTCMonth() > birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() >= birthDate.getUTCDate());
  if (!hasBirthdayPassed) age -= 1;
  return Math.max(0, age);
}

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}%`;
}

function formatMonths(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "-";
  if (value < 1) return `${value.toFixed(1)} mo`;
  if (value < 10) return `${value.toFixed(1)} mo`;
  return `${value.toFixed(0)} mo`;
}

function useAnimatedNumber(
  value: number | null,
  options?: { enabled?: boolean; durationMs?: number },
): number | null {
  const { enabled = true, durationMs = 1400 } = options ?? {};
  const [display, setDisplay] = useState<number | null>(value);
  const previous = useRef<number | null>(value);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (frame.current != null) {
      cancelAnimationFrame(frame.current);
    }

    if (!enabled || value == null || !Number.isFinite(value)) {
      previous.current = value;
      setDisplay(value);
      return undefined;
    }

    const startValue = previous.current;
    if (startValue == null || !Number.isFinite(startValue)) {
      previous.current = value;
      setDisplay(value);
      return undefined;
    }

    if (startValue === value) {
      setDisplay(value);
      return undefined;
    }

    const start = performance.now();
    const delta = value - startValue;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setDisplay(startValue + delta * eased);
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        previous.current = value;
        setDisplay(value);
      }
    };

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current != null) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, [value, enabled, durationMs]);

  return display;
}

function getGoalProgress(current: number, target: number | null): number {
  if (target == null || target <= 0) return 1;
  if (!Number.isFinite(current)) return 0;
  return Math.min(1, Math.max(0, current / target));
}

/** Progress toward a plan: 0 = not started, 1 = achieved. Uses the stricter of savings vs revenue. */
function getPlanProgress(
  plan: WealthLevelDefinition,
  totalSavings: number,
  monthlyRevenue: number,
): number {
  const savingsProgress = getGoalProgress(totalSavings, plan.minSavings ?? null);
  const revenueProgress = getGoalProgress(monthlyRevenue, plan.minMonthlyRevenue ?? null);
  return Math.min(savingsProgress, revenueProgress);
}

type PlanProgressColor = {
  border: string;
  bg: string;
  text: string;
  chip: string;
};

/** Color theme for a plan based on how far it is from being achieved. Finer bands for far plans so levels 3–10 don’t all look the same. */
function getPlanProgressColor(progress: number): PlanProgressColor {
  if (progress >= 1) {
    return {
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      chip: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300",
    };
  }
  if (progress >= 0.7) {
    return {
      border: "border-sky-500/40",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      chip: "bg-sky-500/20 border border-sky-500/40 text-sky-300",
    };
  }
  if (progress >= 0.4) {
    return {
      border: "border-amber-500/40",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      chip: "bg-amber-500/20 border border-amber-500/40 text-amber-300",
    };
  }
  if (progress >= 0.3) {
    return {
      border: "border-orange-500/40",
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      chip: "bg-orange-500/20 border border-orange-500/40 text-orange-300",
    };
  }
  if (progress >= 0.2) {
    return {
      border: "border-rose-500/40",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      chip: "bg-rose-500/20 border border-rose-500/40 text-rose-300",
    };
  }
  if (progress >= 0.1) {
    return {
      border: "border-red-500/40",
      bg: "bg-red-500/10",
      text: "text-red-400",
      chip: "bg-red-500/20 border border-red-500/40 text-red-300",
    };
  }
  return {
    border: "border-slate-500/40",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    chip: "bg-slate-500/20 border border-slate-500/40 text-slate-400",
  };
}

export default function WealthPlansPage() {
  const { canAccess, stage, totalLessonsCompleted } = useWealthUnlocks();
  if (!canAccess("levels")) {
    return null;
  }

  const [state, setState] = useState<WealthState | null>(null);
  const [snapshot, setSnapshot] = useState<WealthLevelsSnapshot | null>(null);
  const [planDefinitions, setPlanDefinitions] = useState<
    WealthLevelDefinition[]
  >(() => getPlanDefinitions());
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [expandedPlanProjectionRows, setExpandedPlanProjectionRows] = useState<
    PlanProjectionRow[]
  >([]);
  const [animateNumbers, setAnimateNumbers] = useState(false);
  const [deferredPlanTargetYears, setDeferredPlanTargetYears] = useState<
    Map<string, number | null> | null
  >(null);
  const [deferredCurrentPlanRows, setDeferredCurrentPlanRows] = useState<
    PlanProjectionRow[] | null
  >(null);
  const planCurrency = "EGP";
  const todayKey = getTodayInKuwait();

  // Load state first; build snapshot with FX when available (fast first paint)
  const refreshSnapshot = (nextState: WealthState | null, fx: number | null) => {
    if (!nextState) return;
    const today = getTodayInKuwait();
    const todayOverview = buildWealthOverview(nextState, today);
    const snap = buildLevelsSnapshot(todayOverview, {
      planCurrency,
      fxRate: fx ?? undefined,
    });
    setSnapshot(snap);
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [s, fxInfo] = await Promise.all([
        loadWealthStateWithRemote(),
        getExchangeRate(),
      ]);
      if (cancelled) return;
      setState(s);
      refreshSnapshot(s, fxInfo?.rate ?? null);
      setFxRate(fxInfo?.rate ?? null);
      setPlanDefinitions(getPlanDefinitions());
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Defer heavy investments/projection calculations until after first paint
  useEffect(() => {
    if (!state || !snapshot) return;
    const currentPlanId = snapshot.currentLevelId;

    const runDeferred = () => {
      const targets = new Map<string, number | null>();
      const instruments = state.instruments ?? [];
      for (const plan of planDefinitions) {
        targets.set(
          plan.id,
          estimatePlanTargetYear(
            plan,
            instruments,
            planCurrency,
            fxRate,
            todayKey,
          ),
        );
      }
      setDeferredPlanTargetYears(targets);

      if (currentPlanId) {
        const plan = planDefinitions.find((p) => p.id === currentPlanId);
        if (plan) {
          const rows = buildPlanProjectionRows(
            plan,
            instruments,
            planCurrency,
            fxRate,
            todayKey,
          );
          setDeferredCurrentPlanRows(rows);
        } else {
          setDeferredCurrentPlanRows([]);
        }
      } else {
        setDeferredCurrentPlanRows([]);
      }
    };

    const id =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(runDeferred, { timeout: 300 })
        : setTimeout(runDeferred, 0);

    return () =>
      typeof cancelIdleCallback !== "undefined"
        ? cancelIdleCallback(id as number)
        : clearTimeout(id as ReturnType<typeof setTimeout>);
  }, [state, snapshot, planDefinitions, planCurrency, fxRate, todayKey]);

  // Calculate projections only when a plan is expanded (lazy per-plan)
  useEffect(() => {
    if (expandedPlanId && state) {
      const plan = planDefinitions.find((p) => p.id === expandedPlanId);
      if (plan) {
        const rows = buildPlanProjectionRows(
          plan,
          state.instruments ?? [],
          planCurrency,
          fxRate,
          todayKey,
        );
        setExpandedPlanProjectionRows(rows);
      }
    } else {
      setExpandedPlanProjectionRows([]);
    }
  }, [expandedPlanId, state, planDefinitions, planCurrency, fxRate, todayKey]);

  const [fiveYearRates, setFiveYearRates] = useState<YearRate[]>(() =>
    loadRates(),
  );

  useEffect(() => {
    setFiveYearRates(loadRates());
  }, []);

  useEffect(() => {
    if (!snapshot || animateNumbers) return;
    const id = requestAnimationFrame(() => setAnimateNumbers(true));
    return () => cancelAnimationFrame(id);
  }, [snapshot, animateNumbers]);

  const currentPlanId = snapshot?.currentLevelId ?? null;
  const currentPlanRows = deferredCurrentPlanRows ?? [];
  const planTargetYears = deferredPlanTargetYears ?? new Map<string, number | null>();

  const totalSavings =
    typeof snapshot?.totalSavings === "number" &&
    Number.isFinite(snapshot.totalSavings)
      ? snapshot.totalSavings
      : 0;
  const monthlyRevenue =
    typeof snapshot?.monthlyPassiveIncome === "number"
      ? snapshot.monthlyPassiveIncome
      : 0;
  const monthsSaved =
    typeof snapshot?.monthsOfExpensesSaved === "number" &&
    Number.isFinite(snapshot.monthsOfExpensesSaved)
      ? snapshot.monthsOfExpensesSaved
      : null;
  const animatedSavings = useAnimatedNumber(totalSavings, {
    enabled: animateNumbers,
  });
  const animatedRevenue = useAnimatedNumber(monthlyRevenue, {
    enabled: animateNumbers,
  });
  const animatedMonthsSaved = useAnimatedNumber(monthsSaved, {
    enabled: animateNumbers,
  });

  const currentPlan = snapshot?.levels.find(
    (lvl) => lvl.id === snapshot.currentLevelId,
  );
  const nextPlan = snapshot?.levels.find(
    (lvl) => lvl.id === snapshot.nextLevelId,
  );

  const targetSavings = currentPlan?.minSavings ?? null;
  const targetRevenue = currentPlan?.minMonthlyRevenue ?? null;

  const savingsGap =
    targetSavings != null ? targetSavings - totalSavings : null;
  const revenueGap =
    targetRevenue != null ? targetRevenue - monthlyRevenue : null;
  const nextPlanReady =
    (savingsGap == null || savingsGap <= 0) &&
    (revenueGap == null || revenueGap <= 0);

  const targetSavingsLabel =
    targetSavings != null && Number.isFinite(targetSavings)
      ? formatCurrency(targetSavings, planCurrency)
      : "Set plan thresholds";
  const targetRevenueLabel =
    targetRevenue != null && Number.isFinite(targetRevenue)
      ? formatCurrency(targetRevenue, planCurrency)
      : "Set plan thresholds";
  const savingsProgress = getGoalProgress(
    animatedSavings ?? totalSavings,
    targetSavings,
  );
  const revenueProgress = getGoalProgress(
    animatedRevenue ?? monthlyRevenue,
    targetRevenue,
  );
  const savingsProgressPercent = Math.round(savingsProgress * 100);
  const revenueProgressPercent = Math.round(revenueProgress * 100);
  const currentSavingsLabel = formatCurrency(
    animatedSavings ?? totalSavings,
    planCurrency,
  );
  const currentRevenueLabel =
    monthlyRevenue > 0
      ? formatCurrency(animatedRevenue ?? monthlyRevenue, planCurrency)
      : "Not logged";

  let nextPlanHint: string | null = null;
  if (nextPlan) {
    const hints: string[] = [];
    if (savingsGap != null && savingsGap > 0) {
      hints.push(
        `Add about ${formatCurrency(savingsGap, planCurrency)} more in savings`,
      );
    }
    if (revenueGap != null && revenueGap > 0) {
      hints.push(
        `Raise monthly revenue by about ${formatCurrency(
          revenueGap,
          planCurrency,
        )}`,
      );
    }
    if (hints.length > 0) {
      nextPlanHint = `${hints.join(" and ")} to reach ${nextPlan.shortLabel}.`;
    }
  }

  // First paint: skeleton + plan definitions (levels name and data) only
  if (!state || !snapshot) {
    return (
      <main className={`${surface} mx-auto max-w-6xl w-full space-y-6 px-0 py-6 lg:py-8`}>
        <header className="pb-4 lg:pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--gaia-text-strong)]">
            Plans
          </h1>
          <p className="mt-1.5 text-sm text-[var(--gaia-text-muted)]">
            Loading your data…
          </p>
        </header>

        <section className="rounded-xl bg-[var(--gaia-surface-soft)] p-4 sm:p-5 md:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 rounded bg-[var(--gaia-ink-soft)]" />
            <div className="h-4 w-full max-w-md rounded bg-[var(--gaia-ink-faint)]" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="h-20 rounded bg-[var(--gaia-ink-faint)]" />
              <div className="h-20 rounded bg-[var(--gaia-ink-faint)]" />
              <div className="h-20 rounded bg-[var(--gaia-ink-faint)]" />
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-[var(--gaia-surface-soft)] p-4 sm:p-5 md:p-6">
          <h2 className="text-sm font-semibold text-[var(--gaia-text-strong)]">
            Plan tiers
          </h2>
          <p className="mt-1 text-xs text-[var(--gaia-text-muted)]">
            Investments and calculations load when ready.
          </p>
          <div className="mt-4 space-y-3">
            {planDefinitions.map((plan) => (
              <div
                key={plan.id}
                className="rounded-lg bg-[var(--gaia-surface)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-semibold text-[var(--gaia-text-strong)]">{plan.shortLabel}</span>
                  <div className="flex gap-4 text-sm text-[var(--gaia-text-muted)]">
                    {plan.project && <span>Project: {plan.project}</span>}
                    <span>Savings: {formatCurrency(plan.minSavings ?? 0, planCurrency)}</span>
                    <span>Revenue: {formatCurrency(plan.minMonthlyRevenue ?? 0, planCurrency)}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--gaia-text-muted)] leading-relaxed">{plan.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={`${surface} mx-auto max-w-6xl w-full space-y-6 px-0 py-6 lg:py-8`}>
      <header className="pb-4 lg:pb-6 px-4 sm:px-5 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--gaia-text-strong)] mt-2 mb-1">
          Plans
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm font-normal text-[var(--gaia-text-muted)] leading-relaxed">
          Savings and monthly revenue thresholds by tier. Amounts in EGP. Expand a plan for details and projection.
        </p>
      </header>

      {/* Summary strip — GAIA theme, no border */}
      <section className="rounded-xl bg-[var(--gaia-surface)] p-4 shadow-sm sm:p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]">Savings</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--gaia-text-strong)]">{currentSavingsLabel}</p>
            <p className="mt-0.5 text-xs text-[var(--gaia-text-muted)]">Target: {targetSavingsLabel}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]">Monthly revenue</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--gaia-text-strong)]">{currentRevenueLabel}</p>
            <p className="mt-0.5 text-xs text-[var(--gaia-text-muted)]">Target: {targetRevenueLabel}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]">Runway</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--gaia-text-strong)]">{formatMonths(monthsSaved)}</p>
            <p className="mt-0.5 text-xs text-[var(--gaia-text-muted)]">Months of expenses saved</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]">Current plan</p>
            <p className="mt-0.5 text-base font-semibold text-[var(--gaia-text-strong)]">{currentPlan?.shortLabel ?? "—"}</p>
            <p className="mt-0.5 text-xs text-[var(--gaia-text-muted)]">Savings {savingsProgressPercent}% · Revenue {revenueProgressPercent}%</p>
          </div>
        </div>
      </section>

      <section className="p-4 sm:p-5 md:p-6">
        <div className="space-y-4">
          {planDefinitions.map((plan, idx) => {
            const isCurrent = plan.id === snapshot.currentLevelId;
            const isExpanded = expandedPlanId === plan.id;
            const targetYear = planTargetYears.get(plan.id) ?? null;
            const targetAge =
              targetYear != null
                ? calculateAge(
                    new Date(Date.UTC(targetYear, 11, 31)),
                    BIRTH_DATE_UTC,
                  )
                : null;
            const progress = getPlanProgress(plan, totalSavings, monthlyRevenue);
            const planColor = getPlanProgressColor(progress);

            return (
              <div
                key={plan.id}
                className="overflow-hidden rounded-xl bg-[var(--gaia-surface)] transition-all duration-200 shadow-sm"
              >
                {/* Plan header — clear hierarchy, no border */}
                <button
                  type="button"
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                  className={`group w-full text-left transition-colors duration-150 ${
                    isExpanded ? "bg-[var(--gaia-ink-faint)]" : "hover:bg-[var(--gaia-ink-faint)]"
                  }`}
                >
                  <div className="flex items-stretch gap-0 min-h-[4.5rem]">
                    {/* Left accent bar — progress color */}
                    <div className={`w-1.5 shrink-0 rounded-l-xl ${planColor.bg}`} aria-hidden />
                    <div className="flex flex-1 min-w-0 items-center justify-between gap-4 px-5 py-4 pl-4">
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`text-lg font-semibold tracking-tight ${planColor.text}`}>
                            {plan.shortLabel}
                          </span>
                          {isCurrent && (
                            <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full ${planColor.chip}`}>
                              Current
                            </span>
                          )}
                          {!isCurrent && progress < 1 && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[var(--gaia-text-muted)] rounded-full bg-[var(--gaia-ink-faint)]">
                              {Math.round(progress * 100)}%
                            </span>
                          )}
                        </div>
                        {(plan.project && (
                          <span className="w-full sm:w-auto flex items-baseline gap-1.5 text-sm">
                            <span className="text-[var(--gaia-text-muted)] font-medium">Project</span>
                            <span className="font-semibold text-[var(--gaia-text-strong)]">{plan.project}</span>
                          </span>
                        )) || null}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                          <span className="flex items-baseline gap-1.5">
                            <span className="text-[var(--gaia-text-muted)] font-medium">Savings</span>
                            <span className="font-semibold tabular-nums text-[var(--gaia-text-strong)]">{formatCurrency(plan.minSavings ?? 0, planCurrency)}</span>
                          </span>
                          <span className="flex items-baseline gap-1.5">
                            <span className="text-[var(--gaia-text-muted)] font-medium">Revenue</span>
                            <span className="font-semibold tabular-nums text-[var(--gaia-text-strong)]">{formatCurrency(plan.minMonthlyRevenue ?? 0, planCurrency)}</span>
                          </span>
                          {(deferredPlanTargetYears === null && (
                            <span className="flex items-baseline gap-1.5">
                              <span className="text-[var(--gaia-text-muted)] font-medium">Est. completion</span>
                              <span className="tabular-nums text-[var(--gaia-text-muted)]">…</span>
                            </span>
                          )) ||
                            (targetYear != null && (
                              <span className="flex items-baseline gap-1.5">
                                <span className="text-[var(--gaia-text-muted)] font-medium">Est. completion</span>
                                <span className="font-semibold tabular-nums text-[var(--gaia-text-strong)]">{targetYear}{targetAge != null ? ` (age ${targetAge})` : ""}</span>
                              </span>
                            ))}
                        </div>
                      </div>
                      <div
                        className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${isExpanded ? "rotate-180 bg-[var(--gaia-ink-soft)]" : "group-hover:bg-[var(--gaia-ink-soft)]"}`}
                        aria-hidden
                      >
                        <svg
                          className="w-5 h-5 text-[var(--gaia-text-muted)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>

                <div
                  className={`transition-all duration-200 ease-out ${isExpanded ? "max-h-[250rem] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
                >
                  {/* Plan Description */}
                  <div className="p-5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)] mb-3">
                      Plan details
                    </h3>
                    <p className="text-sm text-[var(--gaia-text-default)] leading-relaxed whitespace-pre-wrap">
                      {plan.description}
                    </p>
                  </div>

                  {/* Coverage Information */}
                  <div className="p-5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)] mb-3">
                      Coverage
                    </h3>
                    <div className="overflow-x-auto rounded-lg bg-[var(--gaia-surface-soft)]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--gaia-text-muted)]">
                              Metric
                            </th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--gaia-text-muted)]">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-[var(--gaia-text-default)]">
                          <tr>
                            <td className="px-4 py-2.5">Estimated monthly expenses</td>
                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--gaia-text-strong)]">
                              {snapshot.estimatedMonthlyExpenses ? formatCurrency(snapshot.estimatedMonthlyExpenses, planCurrency) : "—"}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5">Monthly passive income</td>
                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--gaia-text-strong)]">
                              {formatCurrency(snapshot.monthlyPassiveIncome ?? 0, planCurrency)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5">Coverage ratio</td>
                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--gaia-text-strong)]">
                              {formatPercent(snapshot.coveragePercent)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5">Survivability</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-[var(--gaia-text-strong)]">{plan.survivability}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5">Enrichment spending</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-[var(--gaia-text-strong)]">{plan.allowedEnrichment}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5">Calendars unlocked</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-[var(--gaia-text-strong)]">{plan.calendarsUnlocked}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-[11px] text-[var(--gaia-text-muted)] leading-relaxed">
                      Coverage = share of estimated monthly expenses that passive income could cover.
                    </p>
                  </div>

                  {/* Projection Table */}
                  {isExpanded && expandedPlanProjectionRows.length === 0 && (
                    <div className="p-5 text-sm text-[var(--gaia-text-muted)]">
                      Loading projection…
                    </div>
                  )}
                  {isExpanded && expandedPlanProjectionRows.length > 0 && (
                    <div className="gaia-projection-table-open">
                      <PlanProjectionTable
                        rows={expandedPlanProjectionRows}
                        planCurrency={planCurrency}
                        title="Wealth projection"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-[var(--gaia-text-muted)] leading-relaxed">
          Each plan is a checkpoint. The goal is to know where you stand and what the next step could be.
        </p>
        {nextPlanHint && (
          <p className="mt-3 text-sm font-medium text-[var(--gaia-positive)]">
            {nextPlanHint}
          </p>
        )}
      </section>
    </main>
  );
}
