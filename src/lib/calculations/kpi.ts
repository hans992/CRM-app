/**
 * KPI calculations - all business logic lives here
 * Keeps UI components clean and focused on presentation
 */

import type { KPIMetrics, TrendData } from "@/types";
import type { Deal } from "@prisma/client";

export function calculateTotalDeals(deals: Deal[]): number {
  return deals.length;
}

export function calculateTotalValue(deals: Deal[]): number {
  return deals.reduce((sum, deal) => sum + deal.value, 0);
}

export function calculateAverageDealValue(deals: Deal[]): number {
  if (deals.length === 0) return 0;
  return calculateTotalValue(deals) / deals.length;
}

export function calculateDealsThisMonth(deals: Deal[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return deals.filter((deal) => new Date(deal.createdAt) >= startOfMonth).length;
}

export function calculateConversionRate(wonDeals: number, totalDeals: number): number {
  if (totalDeals === 0) return 0;
  return (wonDeals / totalDeals) * 100;
}

export function calculateKPIMetrics(deals: Deal[], wonStage = "Closed Won"): KPIMetrics {
  const totalDeals = calculateTotalDeals(deals);
  const totalValue = calculateTotalValue(deals);
  const wonDeals = deals.filter((d) => d.stage === wonStage).length;

  return {
    totalDeals,
    totalValue,
    averageDealValue: calculateAverageDealValue(deals),
    dealsThisMonth: calculateDealsThisMonth(deals),
    conversionRate: calculateConversionRate(wonDeals, totalDeals),
  };
}

export function calculateTrend(current: number, previous: number): TrendData {
  if (previous === 0) {
    return {
      value: current,
      percentage: current > 0 ? 100 : 0,
      isPositive: current > 0,
    };
  }
  const percentage = ((current - previous) / previous) * 100;
  return {
    value: current,
    percentage: Math.abs(percentage),
    isPositive: percentage >= 0,
  };
}

export function calculateDealsLastMonth(deals: Deal[]): number {
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  return deals.filter(
    (deal) =>
      new Date(deal.createdAt) >= startOfLastMonth &&
      new Date(deal.createdAt) <= endOfLastMonth
  ).length;
}

export function calculateTotalValueLastMonth(deals: Deal[]): number {
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  return deals
    .filter(
      (deal) =>
        new Date(deal.createdAt) >= startOfLastMonth &&
        new Date(deal.createdAt) <= endOfLastMonth
    )
    .reduce((sum, deal) => sum + deal.value, 0);
}

export interface FunnelStage {
  stage: string;
  count: number;
  value: number;
}

export function getFunnelData(deals: Deal[]): FunnelStage[] {
  const stageOrder = ["Prospecting", "Qualified", "Negotiating", "Closed Won", "Lost"];
  const grouped = deals.reduce(
    (acc, deal) => {
      const stage = deal.stage;
      if (!acc[stage]) {
        acc[stage] = { count: 0, value: 0 };
      }
      acc[stage].count += 1;
      acc[stage].value += deal.value;
      return acc;
    },
    {} as Record<string, { count: number; value: number }>
  );

  const ordered = stageOrder
    .filter((s) => grouped[s])
    .map((stage) => ({
      stage,
      count: grouped[stage].count,
      value: grouped[stage].value,
    }));

  // Include any stages not in the predefined order
  Object.keys(grouped)
    .filter((s) => !stageOrder.includes(s))
    .forEach((stage) => {
      ordered.push({
        stage,
        count: grouped[stage].count,
        value: grouped[stage].value,
      });
    });

  return ordered;
}

const STAGE_PROBABILITIES: Record<string, number> = {
  Prospecting: 0.1,
  Qualified: 0.3,
  Negotiating: 0.7,
  "Closed Won": 1.0,
  Lost: 0.0,
};

export function calculateForecast(deals: Deal[]): number {
  const openDeals = deals.filter((deal) => deal.stage !== "Closed Won" && deal.stage !== "Lost");
  
  return openDeals.reduce((total, deal) => {
    const probability = STAGE_PROBABILITIES[deal.stage] ?? 0.1;
    const weightedValue = deal.value * probability;
    
    // Ensure we return a valid number (handle NaN/Infinity)
    if (!isFinite(weightedValue)) return total;
    
    return total + weightedValue;
  }, 0);
}

export interface TrendSeriesPoint {
  weekLabel: string;
  dealCount: number;
  totalValue: number;
}

/** Bucket deals by week for the last 12 weeks. Returns oldest to newest. */
export function getTrendSeriesByWeek(deals: Deal[], weeks = 12): TrendSeriesPoint[] {
  const now = new Date();
  const points: TrendSeriesPoint[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7 * (w + 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const inWeek = deals.filter((deal) => {
      const d = new Date(deal.createdAt);
      return d >= weekStart && d <= weekEnd;
    });
    const totalValue = inWeek.reduce((sum, deal) => sum + deal.value, 0);
    const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    points.push({ weekLabel: label, dealCount: inWeek.length, totalValue });
  }

  return points;
}
