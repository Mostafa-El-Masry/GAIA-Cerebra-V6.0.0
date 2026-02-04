"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import type {
  WealthOverview,
  WealthState,
  WealthLevelsSnapshot,
  WealthLevelDefinition,
} from "./lib/types";
import { loadWealthState, loadWealthStateWithRemote } from "./lib/wealthStore";
import { buildWealthOverview, getTodayInKuwait } from "./lib/summary";
import { buildLevelsSnapshot } from "./lib/levels";
import { buildPlanProjectionRows } from "./lib/planProjection";
import { PlanProjectionTable } from "./components/PlanProjectionTable";
import { GLogoLoaderInline } from "@/app/components/Loading";
import { hasSupabaseConfig } from "./lib/remoteWealth";
import { getExchangeRate } from "./lib/exchangeRate";

type FxInfo = {
  rate: number;
  timestamp: number;
  isCached: boolean;
};

const surface = "wealth-surface text-[var(--gaia-text-default)]";

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

const PLAN_LETTERS = "JIHGFEDCBA"; // order 1 -> J, 2 -> I, ... 10 -> A

function getPlanLetter(plan: WealthLevelDefinition): string {
  const idx = plan.order - 1;
  return idx >= 0 && idx < PLAN_LETTERS.length ? PLAN_LETTERS[idx]! : plan.id;
}

function formatNumForPlan(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
}

function getLevelDefinitions(snapshot: WealthLevelsSnapshot | null) {
  if (!snapshot)
    return { current: null as WealthLevelDefinition | null, next: null as WealthLevelDefinition | null };
  const current =
    snapshot.currentLevelId != null
      ? (snapshot.levels.find((l) => l.id === snapshot.currentLevelId) ?? null)
      : null;
  const next =
    snapshot.nextLevelId != null
      ? (snapshot.levels.find((l) => l.id === snapshot.nextLevelId) ?? null)
      : null;
  return { current, next };
}

function getPlanProgress(
  plan: WealthLevelDefinition,
  totalSavings: number,
  monthlyRevenue: number,
): number {
  const savingsTarget = plan.minSavings ?? null;
  const revenueTarget = plan.minMonthlyRevenue ?? null;
  const s = savingsTarget != null && savingsTarget > 0 ? Math.min(1, Math.max(0, totalSavings / savingsTarget)) : 1;
  const r = revenueTarget != null && revenueTarget > 0 ? Math.min(1, Math.max(0, monthlyRevenue / revenueTarget)) : 1;
  return Math.min(s, r);
}

function PhaseProgressBarOverview({
  progress,
  completed,
  remainingSavingsEgp,
  remainingRevenueEgp,
}: {
  progress: number;
  completed?: boolean;
  remainingSavingsEgp?: number | null;
  remainingRevenueEgp?: number | null;
}) {
  const [mounted, setMounted] = useState(false);
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return;
    const t = setTimeout(() => {
      once.current = true;
      setMounted(true);
    }, 150);
    return () => clearTimeout(t);
  }, []);
  const pct = Math.min(100, Math.max(0, progress * 100));
  const width = mounted ? pct : 0;
  const saveRem = remainingSavingsEgp != null && Number.isFinite(remainingSavingsEgp) && remainingSavingsEgp > 0 ? remainingSavingsEgp : null;
  const revRem = remainingRevenueEgp != null && Number.isFinite(remainingRevenueEgp) && remainingRevenueEgp > 0 ? remainingRevenueEgp : null;
  const remainingLabel = completed
    ? "Milestones completed"
    : saveRem != null
      ? `${formatNumForPlan(saveRem)} EGP to save`
      : revRem != null
        ? `${formatNumForPlan(revRem)} EGP revenue remaining`
        : "Toward phase milestones";
  return (
    <div className="w-full mt-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
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

export default function WealthAwakeningClientPage() {
  const [overview, setOverview] = useState<WealthOverview | null>(null);
  const [levelsSnapshot, setLevelsSnapshot] = useState<WealthLevelsSnapshot | null>(null);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "local-only" | "no-supabase">("syncing");
  const [fxInfo, setFxInfo] = useState<FxInfo | null>(null);
  const [phaseProjectionOpen, setPhaseProjectionOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabaseEnabled = hasSupabaseConfig();

    async function init() {
      setSyncStatus(supabaseEnabled ? "syncing" : "no-supabase");

      const [stateResult, fxResult] = await Promise.all([
        (async (): Promise<{ state: WealthState; status: typeof syncStatus }> => {
          if (!supabaseEnabled) return { state: loadWealthState(), status: "no-supabase" };
          try {
            const state = await loadWealthStateWithRemote();
            return { state, status: "synced" as const };
          } catch (e) {
            console.warn("Wealth: fallback to local state", e);
            return { state: loadWealthState(), status: "local-only" as const };
          }
        })(),
        getExchangeRate(),
      ]);

      if (cancelled) return;

      const { state, status } = stateResult;
      const today = getTodayInKuwait();
      const ov = buildWealthOverview(state, today);
      const snapshot = buildLevelsSnapshot(ov, {
        planCurrency: "EGP",
        fxRate: typeof fxResult?.rate === "number" ? fxResult.rate : undefined,
      });

      setSyncStatus(status);
      setOverview(ov);
      setFxInfo(fxResult ?? null);
      setLevelsSnapshot(snapshot);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!overview || !fxInfo?.rate) return;
    setLevelsSnapshot(
      buildLevelsSnapshot(overview, { planCurrency: "EGP", fxRate: fxInfo.rate }),
    );
  }, [overview, fxInfo?.rate]);

  const syncLabel = useMemo(
    () =>
      syncStatus === "syncing"
        ? "Syncing…"
        : syncStatus === "synced"
          ? "Synced"
          : syncStatus === "local-only"
            ? "Local only"
            : "Offline",
    [syncStatus],
  );

  const syncTone = useMemo(
    () =>
      syncStatus === "synced"
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
        : syncStatus === "syncing"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40"
          : "bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600",
    [syncStatus],
  );

  const primaryCurrency = overview?.primaryCurrency ?? "KWD";
  const monthsSaved = levelsSnapshot?.monthsOfExpensesSaved ?? null;
  const { current: currentPlan } = useMemo(
    () => getLevelDefinitions(levelsSnapshot),
    [levelsSnapshot],
  );

  const currentPhaseData = useMemo(() => {
    const levels = levelsSnapshot?.levels ?? [];
    if (levels.length === 0)
      return { phaseNumber: 1, title: "PHASE 1", planTarget: null, condition: null, isFinalPhase: false };
    const current = currentPlan ?? levels[0]!;
    const totalSavings = levelsSnapshot?.totalSavings ?? 0;
    const monthlyRevenue = levelsSnapshot?.monthlyPassiveIncome ?? 0;
    const progress = getPlanProgress(current, totalSavings, monthlyRevenue);
    const isPhase11 = current.order === 10 && progress >= 1;
    const phaseIndex = isPhase11 ? 10 : (current.order - 1);
    const phaseNumber = phaseIndex + 1;
    const planTarget = phaseIndex < 10 ? (levels[phaseIndex] ?? null) : null;
    const condition = phaseIndex > 0 ? (levels[phaseIndex - 1] ?? null) : null;

    let title: string;
    if (phaseIndex === 0) title = `PHASE 1 — PLAN ${getPlanLetter(levels[0]!)}`;
    else if (phaseIndex === 1) title = `PHASE 2 — PLAN ${getPlanLetter(levels[0]!)} (completed) + PLAN ${getPlanLetter(levels[1]!)} (financial only)`;
    else if (phaseIndex < 9 && levels[phaseIndex - 1] && levels[phaseIndex])
      title = `PHASE ${phaseNumber} — PLAN ${getPlanLetter(levels[phaseIndex - 1]!)} (active) + PLAN ${getPlanLetter(levels[phaseIndex]!)} (financial only)`;
    else if (phaseIndex === 9) title = `PHASE 10 — PLAN ${getPlanLetter(levels[8]!)} (active) + PLAN ${getPlanLetter(levels[9]!)} (financial only)`;
    else title = "PHASE 11 — PLAN A (FINAL STATE)";

    return {
      phaseNumber,
      title,
      planTarget,
      condition,
      isFinalPhase: phaseIndex === 10,
    };
  }, [levelsSnapshot, currentPlan]);

  const todayKey = getTodayInKuwait();
  const phaseProjectionRows = useMemo(() => {
    if (!currentPhaseData?.planTarget || !overview?.instruments?.length) return [];
    return buildPlanProjectionRows(
      currentPhaseData.planTarget,
      overview.instruments,
      "EGP",
      fxInfo?.rate ?? null,
      todayKey,
    );
  }, [currentPhaseData?.planTarget, overview?.instruments, fxInfo?.rate, todayKey]);

  const fxText = useMemo(
    () =>
      fxInfo?.rate
        ? `1 ${primaryCurrency} ≈ ${fxInfo.rate.toFixed(2)} EGP${fxInfo.isCached ? " (cached)" : ""}`
        : null,
    [fxInfo, primaryCurrency],
  );

  if (!overview) {
    return (
      <div className={`${surface} mx-auto max-w-4xl lg:max-w-[84rem] min-h-[30vh] rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)]`}>
        <GLogoLoaderInline />
      </div>
    );
  }

  const c = primaryCurrency;
  const runway =
    monthsSaved != null && Number.isFinite(monthsSaved)
      ? `${monthsSaved.toFixed(1)} mo`
      : "—";
  const depositsPlusIncome =
    overview.monthStory.totalDeposits +
    overview.monthStory.totalIncome +
    overview.monthStory.totalInterest;
  const withdrawalsPlusExpenses =
    overview.monthStory.totalWithdrawals + overview.monthStory.totalExpenses;

  return (
    <div className={`${surface} mx-auto w-full max-w-4xl lg:max-w-[84rem] space-y-6 mb-8`}>
      {/* Single top card: everything in one place */}
      <section className="rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--gaia-border)] pb-4">
          <h1 className="text-lg font-semibold text-[var(--gaia-text-strong)]">Wealth</h1>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium ${syncTone}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                syncStatus === "synced"
                  ? "bg-emerald-500"
                  : syncStatus === "syncing"
                    ? "animate-pulse bg-amber-500"
                    : "bg-slate-400"
              }`}
            />
            {syncLabel}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]">
              Net worth
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--gaia-text-strong)]">
              {formatCurrency(overview.totalNetWorth, c)}
            </p>
            <p className="mt-0.5 text-xs text-[var(--gaia-text-muted)]">
              This month: {formatCurrency(overview.monthStory.netChange, c)}
              {overview.monthStory.netChangePercent != null && (
                <span className="ml-1">({formatPercent(overview.monthStory.netChangePercent)})</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]">
              Runway
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--gaia-text-strong)]">
              {runway}
            </p>
            <p className="mt-0.5 text-xs text-[var(--gaia-text-muted)]">Months of expenses saved</p>
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]">
              Primary currency
            </p>
            <p className="mt-0.5 text-xl font-semibold text-[var(--gaia-text-strong)]">{c}</p>
            {fxText && <p className="mt-0.5 text-xs text-[var(--gaia-text-muted)]">{fxText}</p>}
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--gaia-text-muted)]">
              Money map
            </p>
            <p className="mt-0.5 text-xs text-[var(--gaia-text-default)]">
              Cash {formatCurrency(overview.totalCash, c)} · Cert {formatCurrency(overview.totalCertificates, c)} · Invest {formatCurrency(overview.totalInvestments, c)}
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-[var(--gaia-text-muted)]">
              {overview.accounts.length} accounts, {overview.instruments.length} investments
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-[var(--gaia-border)] pt-4">
          <p className="text-xs font-medium text-[var(--gaia-text-muted)]">Monthly story</p>
          <p className="mt-1 text-sm text-[var(--gaia-text-default)]">{overview.monthStory.story}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <span>
              <span className="text-[var(--gaia-text-muted)]">In:</span>{" "}
              <span className="font-medium tabular-nums">{formatCurrency(depositsPlusIncome, c)}</span>
            </span>
            <span>
              <span className="text-[var(--gaia-text-muted)]">Out:</span>{" "}
              <span className="font-medium tabular-nums">{formatCurrency(withdrawalsPlusExpenses, c)}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Current phase — Title first, then Condition, then Plan target (with projection table inside, collapsed by default) */}
      <section className="border-t border-[var(--gaia-border)] pt-6 pb-6 px-4 sm:px-5 md:px-6">
        <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)] mb-4">
          Current phase
        </h2>
        <p className="text-base font-semibold text-[var(--gaia-text-strong)]">
          {currentPhaseData.title}
        </p>
        {currentPhaseData.planTarget?.project && (
          <p className="mt-1.5 text-sm text-[var(--gaia-text-default)]">
            Project: {currentPhaseData.planTarget.project}
          </p>
        )}
        {currentPlan && (
          <PhaseProgressBarOverview
            progress={getPlanProgress(
              currentPlan,
              levelsSnapshot?.totalSavings ?? 0,
              levelsSnapshot?.monthlyPassiveIncome ?? 0,
            )}
            completed={
              currentPhaseData.isFinalPhase ||
              (levelsSnapshot?.nextLevelId === null) ||
              getPlanProgress(
                currentPlan,
                levelsSnapshot?.totalSavings ?? 0,
                levelsSnapshot?.monthlyPassiveIncome ?? 0,
              ) >= 1
            }
            remainingSavingsEgp={
              currentPlan?.minSavings != null && levelsSnapshot?.totalSavings != null
                ? Math.max(0, currentPlan.minSavings - levelsSnapshot.totalSavings)
                : null
            }
            remainingRevenueEgp={
              currentPlan?.minMonthlyRevenue != null && levelsSnapshot?.monthlyPassiveIncome != null
                ? Math.max(0, currentPlan.minMonthlyRevenue - levelsSnapshot.monthlyPassiveIncome)
                : null
            }
          />
        )}
        <div className="mt-3 mb-6">
          {currentPhaseData.isFinalPhase ? (
            <p className="text-sm font-medium text-[var(--gaia-text-strong)]">
              Final state: all plans achieved. Money is insulation; habits and calendars are embodied.
            </p>
          ) : currentPhaseData.planTarget ? (
            <p className="text-sm font-medium text-[var(--gaia-text-strong)]">
              Phase {currentPhaseData.phaseNumber} ends when: Savings ≥{" "}
              {formatNumForPlan(currentPhaseData.planTarget.minSavings ?? 0)} EGP, Monthly revenue ≥{" "}
              {formatNumForPlan(currentPhaseData.planTarget.minMonthlyRevenue ?? 0)} EGP
            </p>
          ) : null}
        </div>
        <div className="space-y-6">
          {/* Condition — on top */}
          <div className="p-5 sm:p-6">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)] mb-2">
              Condition
            </h3>
            {currentPhaseData.condition ? (
              <>
                <p className="text-sm font-medium text-[var(--gaia-text-strong)]">
                  PLAN {getPlanLetter(currentPhaseData.condition)} — {currentPhaseData.condition.shortLabel}
                </p>
                {currentPhaseData.condition.project && (
                  <p className="mt-1.5 text-sm text-[var(--gaia-text-default)]">
                    Project: {currentPhaseData.condition.project}
                  </p>
                )}
                <dl className="mt-3 space-y-1 text-sm text-[var(--gaia-text-default)]">
                  {currentPhaseData.condition.survivability != null && (
                    <div>Survivability: {currentPhaseData.condition.survivability}</div>
                  )}
                  {currentPhaseData.condition.allowedEnrichment != null && (
                    <div>Allowed enrichment: {currentPhaseData.condition.allowedEnrichment}</div>
                  )}
                  {currentPhaseData.condition.calendarsUnlocked != null && (
                    <div>Calendars unlocked: {currentPhaseData.condition.calendarsUnlocked}</div>
                  )}
                </dl>
              </>
            ) : (
              <p className="text-sm text-[var(--gaia-text-muted)]">None yet (first phase).</p>
            )}
          </div>

          {/* Plan target — below Condition; projection table button on the right */}
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
                <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)] mb-2">
                  Plan target
                </h3>
                {currentPhaseData.planTarget ? (
                  <>
                    <p className="text-sm font-medium text-[var(--gaia-text-strong)]">
                      PLAN {getPlanLetter(currentPhaseData.planTarget)} —{" "}
                      {currentPhaseData.planTarget.shortLabel}
                    </p>
                    {currentPhaseData.planTarget.project && (
                      <p className="mt-1.5 text-sm text-[var(--gaia-text-default)]">
                        Project: {currentPhaseData.planTarget.project}
                      </p>
                    )}
                    <dl className="mt-3 space-y-1 text-sm text-[var(--gaia-text-default)]">
                      {currentPhaseData.planTarget.minSavings != null && (
                        <div>Min savings: {formatNumForPlan(currentPhaseData.planTarget.minSavings)} EGP</div>
                      )}
                      {currentPhaseData.planTarget.minMonthlyRevenue != null && (
                        <div>Min monthly revenue: {formatNumForPlan(currentPhaseData.planTarget.minMonthlyRevenue)} EGP</div>
                      )}
                    </dl>
                  </>
                ) : currentPhaseData.isFinalPhase ? (
                  <p className="text-sm text-[var(--gaia-text-default)]">All plans achieved. Final state.</p>
                ) : null}
              </div>
              {currentPhaseData.planTarget && phaseProjectionRows.length > 0 && (
                <div className="shrink-0 sm:pt-6">
                  <button
                    type="button"
                    onClick={() => setPhaseProjectionOpen((o) => !o)}
                    className="rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--gaia-text-strong)] shadow-sm transition hover:border-[var(--gaia-text-muted)]/40 hover:bg-[var(--gaia-surface-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--gaia-text-muted)]/30 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    {phaseProjectionOpen ? "Hide projection table" : "Projection table"}
                  </button>
                </div>
              )}
            </div>
            {currentPhaseData.planTarget && phaseProjectionRows.length > 0 && (
              <div
                className="overflow-hidden transition-[max-height,opacity] duration-[600ms] ease-in-out"
                style={{
                  maxHeight: phaseProjectionOpen ? "250rem" : "0",
                  opacity: phaseProjectionOpen ? 1 : 0,
                  pointerEvents: phaseProjectionOpen ? undefined : "none",
                }}
              >
                <div className="mt-5">
                  <PlanProjectionTable
                    rows={phaseProjectionRows}
                    planCurrency="EGP"
                    title=""
                    compact
                    isOpen={phaseProjectionOpen}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
