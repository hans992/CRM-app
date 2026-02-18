/**
 * KPI calculations - all business logic lives here
 * Keeps UI components clean and focused on presentation
 */

import type { KPIMetrics } from "@/types";
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

export function calculateKPIMetrics(deals: Deal[], wonStage = "Won"): KPIMetrics {
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
