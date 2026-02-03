"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { PlanProjectionRow, ProjectionColumnKey } from "../lib/planProjection";
import {
  PLAN_PROJECTION_COLUMNS,
  PLAN_PROJECTION_COLUMN_LABELS,
  PLAN_PROJECTION_COLUMN_WIDTHS,
} from "../lib/planProjection";

const HIDE_ON_SMALL_SCREEN: ProjectionColumnKey[] = ["age", "depositYear"];
const SMALL_SCREEN_MAX = 640;
const NUMBER_ANIMATION_DURATION_MS = 4000;

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Ease-out cubic: fast start, slow end */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

type AnimatedNumberProps = {
  value: number;
  format: "currency" | "percent" | "integer";
  planCurrency: string;
  animationTrigger: boolean;
  duration?: number;
};

function AnimatedNumber({
  value,
  format,
  planCurrency,
  animationTrigger,
  duration = NUMBER_ANIMATION_DURATION_MS,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(animationTrigger ? 0 : value);
  const hasAnimatedRef = useRef(false);
  const prevTriggerRef = useRef(animationTrigger);

  useEffect(() => {
    if (!animationTrigger) {
      hasAnimatedRef.current = false;
      prevTriggerRef.current = false;
      setDisplayValue(0);
      return;
    }
    if (animationTrigger && !prevTriggerRef.current) {
      hasAnimatedRef.current = false;
    }
    prevTriggerRef.current = animationTrigger;
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    setDisplayValue(0);
    const start = performance.now();
    const startValue = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      const raw = startValue + (value - startValue) * eased;
      const current = format === "percent" ? raw : Math.round(raw);
      setDisplayValue(current);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [animationTrigger, value, duration, format]);

  useEffect(() => {
    if (!animationTrigger) setDisplayValue(0);
  }, [animationTrigger]);

  if (!Number.isFinite(value)) return <>-</>;

  if (format === "currency") {
    return <>{formatCurrency(displayValue, planCurrency)}</>;
  }
  if (format === "percent") {
    return <>{displayValue.toFixed(2)}%</>;
  }
  return <>{Math.round(displayValue)}</>;
}

type PlanProjectionTableProps = {
  rows: PlanProjectionRow[];
  planCurrency: string;
  /** Optional title above the table */
  title?: string;
  /** Use compact styling (e.g. for overview embed) */
  compact?: boolean;
  /** When false, numbers stay at 0 until open; when true or undefined, count-up runs (e.g. on mount) */
  isOpen?: boolean;
};

export function PlanProjectionTable({
  rows,
  planCurrency,
  title = "Wealth projection",
  compact = false,
  isOpen = true,
}: PlanProjectionTableProps) {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const animationTrigger = isOpen;

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${SMALL_SCREEN_MAX}px)`);
    const update = () => setIsSmallScreen(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const columns = compact && isSmallScreen
    ? PLAN_PROJECTION_COLUMNS.filter((k) => !HIDE_ON_SMALL_SCREEN.includes(k))
    : PLAN_PROJECTION_COLUMNS;

  const getCellClasses = (
    key: ProjectionColumnKey,
    isMonth: boolean,
    useCompactPadding = false,
  ): string => {
    const align = key === "year" || key === "age" ? "" : "text-right";
    const base = useCompactPadding
      ? isMonth ? "py-1 sm:py-2" : "py-1.5 sm:py-3"
      : isMonth ? "py-2" : "py-3";
    const px = useCompactPadding ? "px-1 sm:px-2" : "px-2";
    const pr = useCompactPadding ? "pr-1 sm:pr-2" : "pr-2";
    const pl = useCompactPadding ? "pl-2 sm:pl-4" : "pl-4";
    const textSize = useCompactPadding ? "text-[0.625rem] sm:text-[0.6875rem]" : "text-[0.6875rem]";
    if (isMonth) {
      const monthBg = "bg-blue-600/10";
      if (key === "year") {
        return `${base} ${pr} ${pl} ${textSize} text-white ${monthBg} ${align}`.trim();
      }
      if (key === "age") {
        return `${base} ${px} ${textSize} text-white ${monthBg} ${align}`.trim();
      }
      if (key === "deposit" || key === "revenue" || key === "endBalance") {
        return `${base} ${px} ${textSize} font-semibold text-white ${monthBg} ${align}`.trim();
      }
      return `${base} ${px} ${textSize} text-white ${monthBg} ${align}`.trim();
    }

    const hoverBg = "group-hover:bg-blue-600/12";
    if (key === "year") {
      return `${base} ${pr} ${textSize} text-white ${hoverBg}`.trim();
    }
    if (key === "age") {
      return `${base} ${px} ${textSize} text-white ${hoverBg}`.trim();
    }
    if (key === "deposit" || key === "revenue" || key === "endBalance") {
      return `${base} ${px} ${textSize} font-semibold text-white ${hoverBg} ${align}`.trim();
    }
    return `${base} ${px} ${textSize} text-white ${hoverBg} ${align}`.trim();
  };

  const renderYearCell = (key: ProjectionColumnKey, row: PlanProjectionRow) => {
    switch (key) {
      case "year":
        return (
          <AnimatedNumber
            value={row.year}
            format="integer"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "age":
        return (
          <AnimatedNumber
            value={row.age}
            format="integer"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "startBalance":
        return (
          <AnimatedNumber
            value={row.startBalance}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "deposit":
        return (
          <AnimatedNumber
            value={row.deposit}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "depositYear":
        return (
          <AnimatedNumber
            value={row.depositYear}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "revenue":
        return (
          <AnimatedNumber
            value={row.revenue}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "endBalance":
        return (
          <AnimatedNumber
            value={row.endBalance}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "rate":
        return (
          <AnimatedNumber
            value={row.rate}
            format="percent"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "uninvested":
        return (
          <AnimatedNumber
            value={row.uninvested}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      default:
        return "";
    }
  };

  const renderMonthCell = (
    key: ProjectionColumnKey,
    month: PlanProjectionRow["months"][number],
  ) => {
    switch (key) {
      case "year":
        return month.month;
      case "age":
        return (
          <AnimatedNumber
            value={month.age}
            format="integer"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "startBalance":
        return (
          <AnimatedNumber
            value={month.startBalance}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "deposit":
        return (
          <AnimatedNumber
            value={month.deposit}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "depositYear":
        return (
          <AnimatedNumber
            value={month.depositYear}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "revenue":
        return (
          <AnimatedNumber
            value={month.revenue}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "endBalance":
        return (
          <AnimatedNumber
            value={month.endBalance}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "rate":
        return (
          <AnimatedNumber
            value={month.rate}
            format="percent"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      case "uninvested":
        return (
          <AnimatedNumber
            value={month.uninvested}
            format="currency"
            planCurrency={planCurrency}
            animationTrigger={animationTrigger}
          />
        );
      default:
        return "";
    }
  };

  if (rows.length === 0) return null;

  const columnCount = columns.length;
  const compactPadding = compact;

  return (
    <div className={compact ? "mt-4 bg-transparent" : "p-5"}>
      {title && (
        <h3 className="text-sm font-semibold text-white mb-1">
          {title}
        </h3>
      )}
      <div className={`mt-4 overflow-x-hidden ${compact ? "text-[0.625rem] sm:text-xs" : ""}`}>
        <table className={`min-w-full table-fixed border-separate text-left text-white ${compact ? "border-spacing-y-1 sm:border-spacing-y-2" : "border-spacing-y-2"}`}>
          <colgroup>
            {columns.map((key) => (
              <col key={key} style={{ width: PLAN_PROJECTION_COLUMN_WIDTHS[key] }} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-800 text-[0.6875rem] uppercase tracking-wide text-white">
              {columns.map((key) => {
                const isRight = key !== "year" && key !== "age";
                return (
                  <th
                    key={key}
                    className={compact ? `py-1 sm:py-2 ${isRight ? "px-1 sm:px-2 text-right" : "pr-1 sm:pr-2"}` : `py-2 ${isRight ? "px-2 text-right" : "pr-2"}`}
                  >
                    {PLAN_PROJECTION_COLUMN_LABELS[key]}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <Fragment key={`${row.year}-${rowIdx}`}>
                <tr
                  className="group cursor-pointer text-white transition"
                  onClick={() =>
                    setExpandedYear(expandedYear === row.year ? null : row.year)
                  }
                >
                  {columns.map((key, idx) => {
                    const rounding =
                      idx === 0
                        ? "rounded-l-xl"
                        : idx === columnCount - 1
                          ? "rounded-r-xl"
                          : "";
                    return (
                      <td
                        key={key}
                        className={`${getCellClasses(key, false, compactPadding)} ${rounding}`}
                      >
                        {renderYearCell(key, row)}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-slate-800">
                  <td colSpan={columnCount} className="p-0 align-top">
                    <div
                      className="grid overflow-hidden transition-[grid-template-rows] duration-[600ms] ease-in-out"
                      style={{
                        gridTemplateRows: expandedYear === row.year ? "1fr" : "0fr",
                      }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <table className={`w-full table-fixed border-separate text-left text-white ${compact ? "border-spacing-y-0.5 sm:border-spacing-y-1 text-[0.625rem] sm:text-xs" : "border-spacing-y-1 text-xs"}`}>
                          <colgroup>
                            {columns.map((key) => (
                              <col key={key} style={{ width: PLAN_PROJECTION_COLUMN_WIDTHS[key] }} />
                            ))}
                          </colgroup>
                          <tbody>
                            {row.months.map((month, monthIdx) => (
                              <tr
                                key={`${row.year}-${monthIdx}`}
                                className="border-b border-slate-800 text-slate-300"
                              >
                                {columns.map((key, colIdx) => {
                                  const rounding =
                                    colIdx === 0
                                      ? "rounded-l-xl"
                                      : colIdx === columnCount - 1
                                        ? "rounded-r-xl"
                                        : "";
                                  return (
                                    <td
                                      key={key}
                                      className={`${getCellClasses(key, true, compactPadding)} ${rounding}`}
                                    >
                                      {renderMonthCell(key, month)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {!compact && (
        <p className="mt-3 text-[0.6875rem] text-slate-500">
          Click a year to expand monthly details.{" "}
          <button
            type="button"
            onClick={() =>
              setExpandedYear(
                expandedYear === null ? (rows[0]?.year ?? null) : null,
              )
            }
            className="text-slate-400 hover:text-slate-200 underline"
          >
            {expandedYear ? "Collapse all" : "Expand first year"}
          </button>
        </p>
      )}
    </div>
  );
}
