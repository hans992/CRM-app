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
