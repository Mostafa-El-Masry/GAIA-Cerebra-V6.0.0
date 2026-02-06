"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { loadWealthStateWithRemote } from "@/app/wealth/lib/wealthStore";
import { buildWealthOverview, getTodayInKuwait } from "@/app/wealth/lib/summary";
import { buildLevelsSnapshot } from "@/app/wealth/lib/levels";
import { getExchangeRate } from "@/app/wealth/lib/exchangeRate";
import type { WealthOverview } from "@/app/wealth/lib/types";
import type { WealthLevelDefinition } from "@/app/wealth/lib/types";

/**
 * Wealth widget: net worth, breakdown, and current phase financial target with amount to reach.
 */
function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNum(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

const PLAN_LETTERS = "JIHGFEDCBA";
function getPlanLetter(plan: WealthLevelDefinition): string {
  const idx = plan.order - 1;
  return idx >= 0 && idx < PLAN_LETTERS.length ? PLAN_LETTERS[idx]! : plan.id;
}

type PhaseSummary = {
  phaseNumber: number;
  phaseLabel: string;
  targetSavings: number | null;
  targetRevenue: number | null;
  remainingSavings: number | null;
  remainingRevenue: number | null;
};

function getPhaseSummary(
  overview: WealthOverview,
  snapshot: { currentLevelId: string | null; levels: WealthLevelDefinition[]; totalSavings: number; monthlyPassiveIncome: number | null },
): PhaseSummary | null {
  if (!snapshot.currentLevelId) return null;
  const current = snapshot.levels.find((l) => l.id === snapshot.currentLevelId) ?? null;
  if (!current) return null;
  const totalSavings = snapshot.totalSavings;
  const monthlyRevenue = snapshot.monthlyPassiveIncome ?? 0;
  const targetSavings = current.minSavings ?? null;
  const targetRevenue = current.minMonthlyRevenue ?? null;
  const remainingSavings =
    targetSavings != null ? Math.max(0, targetSavings - totalSavings) : null;
  const remainingRevenue =
    targetRevenue != null ? Math.max(0, targetRevenue - monthlyRevenue) : null;
  return {
    phaseNumber: current.order,
    phaseLabel: `Phase ${current.order} — PLAN ${getPlanLetter(current)}`,
    targetSavings,
    targetRevenue,
    remainingSavings,
    remainingRevenue,
  };
}

export default function WealthSpark() {
  const [overview, setOverview] = useState<WealthOverview | null>(null);
  const [phaseSummary, setPhaseSummary] = useState<PhaseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [state, fxResult] = await Promise.all([
          loadWealthStateWithRemote(),
          getExchangeRate().catch(() => null),
        ]);
        if (cancelled) return;
        const today = getTodayInKuwait();
        const built = buildWealthOverview(state, today);
        const hasData =
          built.accounts.length > 0 ||
          built.instruments.length > 0 ||
          built.flows.length > 0;
        if (cancelled) return;
        setOverview(hasData ? built : null);
        if (!hasData) {
          setPhaseSummary(null);
          return;
        }
        const snapshot = buildLevelsSnapshot(built, {
          planCurrency: "EGP",
          fxRate: typeof fxResult?.rate === "number" ? fxResult.rate : undefined,
        });
        if (cancelled) return;
        setPhaseSummary(getPhaseSummary(built, snapshot));
      } catch {
        if (!cancelled) {
          setOverview(null);
          setPhaseSummary(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-[var(--gaia-text-default)]">Loading…</div>
    );
  }

  if (!overview) {
    return (
      <div className="space-y-2 text-sm text-[var(--gaia-text-default)]">
        <p>No data.</p>
        <p>
          <Link
            href="/wealth"
            className="font-medium text-[var(--gaia-contrast-bg)] hover:underline"
          >
            Open Wealth overview
          </Link>{" "}
          to add accounts and see your net worth.
        </p>
      </div>
    );
  }

  const { totalNetWorth, totalCash, totalCertificates, totalInvestments, primaryCurrency } = overview;
  const hasBreakdown = totalCash > 0 || totalCertificates > 0 || totalInvestments > 0;

  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold tabular-nums text-[var(--gaia-text-strong)]">
        {formatCurrency(totalNetWorth, primaryCurrency)}
      </p>
      {hasBreakdown && (
        <ul className="space-y-0.5 text-sm text-[var(--gaia-text-default)]">
          {totalCash > 0 && (
            <li>Cash {formatCurrency(totalCash, primaryCurrency)}</li>
          )}
          {totalCertificates > 0 && (
            <li>Certificates {formatCurrency(totalCertificates, primaryCurrency)}</li>
          )}
          {totalInvestments > 0 && (
            <li>Investments {formatCurrency(totalInvestments, primaryCurrency)}</li>
          )}
        </ul>
      )}
      {phaseSummary && (
        <div className="space-y-1 border-t border-[var(--gaia-border)] pt-3 text-sm">
          <p className="font-medium text-[var(--gaia-text-strong)]">
            {phaseSummary.phaseLabel}
          </p>
          <p className="text-[var(--gaia-text-default)]">
            Financial target:{" "}
            {phaseSummary.targetSavings != null && (
              <span>{formatNum(phaseSummary.targetSavings)} EGP savings</span>
            )}
            {phaseSummary.targetSavings != null && phaseSummary.targetRevenue != null && " · "}
            {phaseSummary.targetRevenue != null && (
              <span>{formatNum(phaseSummary.targetRevenue)} EGP/mo revenue</span>
            )}
          </p>
          {(phaseSummary.remainingSavings != null && phaseSummary.remainingSavings > 0) ||
          (phaseSummary.remainingRevenue != null && phaseSummary.remainingRevenue > 0) ||
          ((phaseSummary.targetSavings != null || phaseSummary.targetRevenue != null) &&
            (phaseSummary.remainingSavings ?? 0) <= 0 &&
            (phaseSummary.remainingRevenue ?? 0) <= 0) ? (
            <p className="text-xs text-[var(--gaia-text-muted)]">
              To reach:{" "}
              {phaseSummary.remainingSavings != null && phaseSummary.remainingSavings > 0 && (
                <span>{formatNum(phaseSummary.remainingSavings)} EGP to save</span>
              )}
              {phaseSummary.remainingSavings != null && phaseSummary.remainingSavings > 0 && phaseSummary.remainingRevenue != null && phaseSummary.remainingRevenue > 0 && " · "}
              {phaseSummary.remainingRevenue != null && phaseSummary.remainingRevenue > 0 && (
                <span>{formatNum(phaseSummary.remainingRevenue)} EGP revenue to reach</span>
              )}
              {(phaseSummary.targetSavings != null || phaseSummary.targetRevenue != null) &&
                (phaseSummary.remainingSavings ?? 0) <= 0 &&
                (phaseSummary.remainingRevenue ?? 0) <= 0 && (
                <span>Target met for this phase</span>
              )}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
