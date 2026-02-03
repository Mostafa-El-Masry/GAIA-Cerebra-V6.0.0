import type { WealthLevelDefinition, WealthInstrument } from "./types";
import { bankRateForYear } from "./bankRates";

const BIRTH_DATE_UTC = new Date(Date.UTC(1991, 7, 10));
const REINVEST_STEP = 1000;

export type PlanProjectionRow = {
  year: number;
  age: number;
  startBalance: number;
  deposit: number;
  depositYear: number;
  revenue: number;
  endBalance: number;
  rate: number;
  uninvested: number;
  months: {
    month: string;
    age: number;
    startBalance: number;
    deposit: number;
    depositYear: number;
    revenue: number;
    endBalance: number;
    rate: number;
    uninvested: number;
  }[];
};

export type ProjectionColumnKey =
  | "year"
  | "age"
  | "startBalance"
  | "deposit"
  | "depositYear"
  | "revenue"
  | "endBalance"
  | "rate"
  | "uninvested";

export const PLAN_PROJECTION_COLUMNS: ProjectionColumnKey[] = [
  "year",
  "age",
  "startBalance",
  "deposit",
  "depositYear",
  "revenue",
  "endBalance",
  "rate",
  "uninvested",
];

export const PLAN_PROJECTION_COLUMN_LABELS: Record<ProjectionColumnKey, string> = {
  year: "Year",
  age: "Age",
  startBalance: "Starting balance",
  deposit: "Invested",
  depositYear: "Invested per year",
  revenue: "Revenue",
  endBalance: "Ending balance",
  rate: "Rate",
  uninvested: "Uninvested revenue",
};

export const PLAN_PROJECTION_COLUMN_WIDTHS: Record<ProjectionColumnKey, string> = {
  year: "4rem",
  age: "3.375rem",
  startBalance: "7.5rem",
  deposit: "7.5rem",
  depositYear: "8.125rem",
  revenue: "6.875rem",
  endBalance: "7.5rem",
  rate: "4.375rem",
  uninvested: "8.125rem",
};

type RateInstrument = {
  startDate: string;
  termMonths: number;
  annualRatePercent: number;
};

type ProjectionInstrument = RateInstrument & {
  principal: number;
};

function calculateAge(today: Date, birthDate: Date): number {
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const hasBirthdayPassed =
    today.getUTCMonth() > birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() >= birthDate.getUTCDate());
  if (!hasBirthdayPassed) {
    age -= 1;
  }
  return Math.max(0, age);
}

function parseDayKey(day: string): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = day.split("-").map((v) => parseInt(v, 10));
  return {
    year: Number.isFinite(y) ? y : 1970,
    month: Number.isFinite(m) ? m : 1,
    day: Number.isFinite(d) ? d : 1,
  };
}

function monthsBetween(start: string, end: string): number {
  const s = parseDayKey(start);
  const e = parseDayKey(end);
  return (e.year - s.year) * 12 + (e.month - s.month);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function convertToPlanCurrency(
  amount: number,
  currency: string,
  planCurrency: string,
  fxRate: number | null,
): number {
  if (currency === planCurrency) return amount;
  if (planCurrency === "EGP" && currency === "KWD" && fxRate) {
    return amount * fxRate;
  }
  if (planCurrency === "KWD" && currency === "EGP" && fxRate) {
    return amount / fxRate;
  }
  return amount;
}

function initialRateForInstrument(inst: WealthInstrument): number {
  const storedRate = Number(inst.annualRatePercent) || 0;
  if (storedRate > 0) return storedRate;
  const startYear = parseDayKey(inst.startDate).year;
  return bankRateForYear(startYear);
}

function effectiveRateForMonth(inst: RateInstrument, monthKey: string): number {
  const baseRate = Number(inst.annualRatePercent) || 0;
  const termMonths = Math.max(0, Number(inst.termMonths) || 0);
  if (!inst.startDate || termMonths <= 0) return baseRate;
  const elapsed = monthsBetween(inst.startDate, monthKey);
  if (elapsed < 0) return baseRate;
  const renewalIndex = Math.floor(elapsed / termMonths);
  if (renewalIndex <= 0) return baseRate;
  const start = parseDayKey(inst.startDate);
  const renewalMonths = termMonths * renewalIndex;
  const totalMonths = start.year * 12 + (start.month - 1) + renewalMonths;
  const renewalYear = Math.floor(totalMonths / 12);
  return bankRateForYear(renewalYear);
}

export function buildPlanProjectionRows(
  plan: WealthLevelDefinition,
  instruments: WealthInstrument[],
  planCurrency: string,
  fxRate: number | null,
  todayKey: string,
): PlanProjectionRow[] {
  const todayDate = new Date(`${todayKey}T00:00:00Z`);
  const projectionInstruments: ProjectionInstrument[] = instruments
    .map((inst) => {
      const principalRaw = Number(inst.principal) || 0;
      if (principalRaw <= 0) return null;
      const termMonths = Math.max(0, Number(inst.termMonths) || 0);
      if (!inst.startDate || termMonths <= 0) return null;
      return {
        principal: convertToPlanCurrency(
          principalRaw,
          inst.currency,
          planCurrency,
          fxRate,
        ),
        startDate: inst.startDate,
        termMonths,
        annualRatePercent: initialRateForInstrument(inst),
      };
    })
    .filter((inst): inst is ProjectionInstrument => inst !== null);

  const totalPrincipal = projectionInstruments.reduce(
    (sum, inst) => sum + inst.principal,
    0,
  );
  if (totalPrincipal <= 0) return [];
  const baseRate =
    projectionInstruments.reduce(
      (sum, inst) => sum + inst.principal * inst.annualRatePercent,
      0,
    ) / totalPrincipal;
  let reinvestBucket = 0;

  const targetSavings = plan.minSavings ?? 0;
  const targetRevenue = plan.minMonthlyRevenue ?? 0;

  const rows: PlanProjectionRow[] = [];
  let currentYear = todayDate.getUTCFullYear();
  let yearRow: PlanProjectionRow | null = null;
  let reached = false;

  const maxMonths = 1200;
  for (let i = 0; i < maxMonths; i += 1) {
    const cursor = new Date(
      Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() + i, 1),
    );
    const year = cursor.getUTCFullYear();
    const monthKey = toIsoDate(cursor);

    if (year !== currentYear) {
      if (yearRow) {
        rows.push(yearRow);
      }
      currentYear = year;
      yearRow = null;
    }

    const startPrincipal = projectionInstruments.reduce(
      (sum, inst) => sum + inst.principal,
      0,
    );
    const startBalance = startPrincipal + reinvestBucket;
    let eligiblePrincipal = 0;
    let monthlyRevenue = 0;
    for (const inst of projectionInstruments) {
      const elapsed = monthsBetween(inst.startDate, monthKey);
      if (elapsed < 1) continue;
      const rate = effectiveRateForMonth(inst, monthKey);
      eligiblePrincipal += inst.principal;
      monthlyRevenue += (inst.principal * rate) / 100 / 12;
    }
    const effectiveRate =
      eligiblePrincipal > 0
        ? (monthlyRevenue / eligiblePrincipal) * 12 * 100
        : baseRate;
    const bucketTotal = reinvestBucket + monthlyRevenue;
    const investable = Math.floor(bucketTotal / REINVEST_STEP) * REINVEST_STEP;
    reinvestBucket = bucketTotal - investable;
    if (investable > 0) {
      projectionInstruments.push({
        principal: investable,
        startDate: monthKey,
        termMonths: 36,
        annualRatePercent: bankRateForYear(year),
      });
    }
    const endPrincipal = startPrincipal + investable;
    const endBalance = endPrincipal + reinvestBucket;
    const monthLabel = cursor.toLocaleDateString("en-US", { month: "short" });

    if (!yearRow) {
      yearRow = {
        year,
        age: calculateAge(new Date(Date.UTC(year, 11, 31)), BIRTH_DATE_UTC),
        startBalance,
        deposit: endPrincipal,
        depositYear: investable,
        revenue: monthlyRevenue,
        endBalance,
        rate: effectiveRate,
        uninvested: reinvestBucket,
        months: [
          {
            month: monthLabel,
            age: calculateAge(cursor, BIRTH_DATE_UTC),
            startBalance,
            deposit: endPrincipal,
            depositYear: investable,
            revenue: monthlyRevenue,
            endBalance,
            rate: effectiveRate,
            uninvested: reinvestBucket,
          },
        ],
      };
    } else {
      yearRow.deposit = endPrincipal;
      yearRow.depositYear += investable;
      yearRow.revenue += monthlyRevenue;
      yearRow.endBalance = endBalance;
      yearRow.rate = effectiveRate;
      yearRow.uninvested = reinvestBucket;
      yearRow.months.push({
        month: monthLabel,
        age: calculateAge(cursor, BIRTH_DATE_UTC),
        startBalance,
        deposit: endPrincipal,
        depositYear: investable,
        revenue: monthlyRevenue,
        endBalance,
        rate: effectiveRate,
        uninvested: reinvestBucket,
      });
    }

    if (endBalance >= targetSavings && monthlyRevenue >= targetRevenue) {
      reached = true;
      break;
    }
  }

  if (yearRow) {
    rows.push(yearRow);
  }

  if (!reached) {
    return rows;
  }
  return rows;
}

export function estimatePlanTargetYear(
  plan: WealthLevelDefinition,
  instruments: WealthInstrument[],
  planCurrency: string,
  fxRate: number | null,
  todayKey: string,
): number | null {
  const targetSavings = plan.minSavings ?? 0;
  const targetRevenue = plan.minMonthlyRevenue ?? 0;
  if (targetSavings <= 0 && targetRevenue <= 0) {
    const y = parseInt(todayKey.slice(0, 4), 10);
    return Number.isFinite(y) ? y : new Date().getUTCFullYear();
  }
  const rows = buildPlanProjectionRows(
    plan,
    instruments,
    planCurrency,
    fxRate,
    todayKey,
  );
  if (rows.length === 0) return null;
  const lastRow = rows[rows.length - 1];
  const lastMonth = lastRow.months[lastRow.months.length - 1];
  if (!lastMonth) return null;
  const reached =
    lastMonth.endBalance >= targetSavings && lastMonth.revenue >= targetRevenue;
  return reached ? lastRow.year : null;
}
