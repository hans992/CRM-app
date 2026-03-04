"use client";

import { useMemo } from "react";
import { KPICard } from "./KPICard";
import { RecentDealsTable } from "./RecentDealsTable";
import { PipelineFunnelChart } from "./PipelineFunnelChart";
import { RevenueTrendChart } from "./RevenueTrendChart";
import { EmptyDashboardState } from "./EmptyDashboardState";
import { TeamLeaderboard } from "./TeamLeaderboard";
import {
  calculateKPIMetrics,
  calculateTrend,
  calculateDealsLastMonth,
  calculateTotalValueLastMonth,
  getFunnelData,
  getTrendSeriesByWeek,
  calculateForecast,
} from "@/lib/calculations";
import type { Deal } from "@prisma/client";
import { UserRole } from "@/lib/auth";
import { useDashboardPreferencesStore } from "@/stores/preferences";
import {
  getVisibleGridWidgetIds,
  type GridWidgetId,
} from "@/lib/dashboard-preferences";

type DealWithOwner = Deal & { owner: { id: string; name: string; email: string } | null };

interface DashboardContentProps {
  initialLayout: unknown;
  deals: DealWithOwner[];
  userRole: string;
  leaderboard: { userId: string; userName: string; totalClosedWonValue: number }[] | null;
}

export function DashboardContent({
  initialLayout: _initialLayout,
  deals,
  userRole,
  leaderboard,
}: DashboardContentProps) {
  const preferences = useDashboardPreferencesStore((s) => s.preferences);
  const visibleIds = useMemo(
    () => getVisibleGridWidgetIds(preferences),
    [preferences]
  );

  if (deals.length === 0) {
    return <EmptyDashboardState />;
  }

  const metrics = calculateKPIMetrics(deals);
  const dealsLastMonth = calculateDealsLastMonth(deals);
  const valueLastMonth = calculateTotalValueLastMonth(deals);
  const funnelData = getFunnelData(deals);
  const trendData = getTrendSeriesByWeek(deals);
  const forecast = calculateForecast(deals);

  const formatCurrency = (value: number) => {
    if (!isFinite(value) || isNaN(value)) return "$0.00";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };

  const showLeaderboard =
    (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) &&
    leaderboard &&
    preferences.show_team_leaderboard;

  const renderWidget = (id: GridWidgetId) => {
    switch (id) {
      case "total_deals":
        return (
          <KPICard
            title="Total Deals"
            value={metrics.totalDeals}
            trend={calculateTrend(metrics.totalDeals, deals.length - metrics.dealsThisMonth)}
            delayMs={0}
          />
        );
      case "total_value":
        return (
          <KPICard
            title="Total Value"
            value={formatCurrency(metrics.totalValue)}
            subtitle="Pipeline value"
            trend={calculateTrend(metrics.totalValue, metrics.totalValue - valueLastMonth)}
            target={100000}
            delayMs={50}
          />
        );
      case "avg_deal_value":
        return (
          <KPICard
            title="Avg Deal Value"
            value={formatCurrency(metrics.averageDealValue)}
            delayMs={100}
          />
        );
      case "deals_this_month":
        return (
          <KPICard
            title="Deals This Month"
            value={metrics.dealsThisMonth}
            subtitle={
              metrics.conversionRate !== undefined
                ? `${metrics.conversionRate.toFixed(1)}% conversion`
                : undefined
            }
            trend={calculateTrend(metrics.dealsThisMonth, dealsLastMonth)}
            target={15}
            delayMs={150}
          />
        );
      case "weighted_forecast":
        return (
          <KPICard
            title="Weighted Forecast"
            value={formatCurrency(forecast)}
            subtitle="Expected revenue"
            target={70000}
            delayMs={200}
          />
        );
      case "pipeline_health":
        return (
          <div className="flex min-h-fit flex-col overflow-visible">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pipeline health
            </h2>
            <div className="min-h-fit overflow-visible">
              {funnelData.length > 0 ? (
                <PipelineFunnelChart data={funnelData} />
              ) : (
                <div className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 bg-surface py-8 text-muted">
                  <p className="text-sm">No data for this period</p>
                </div>
              )}
            </div>
          </div>
        );
      case "revenue_trend":
        return (
          <div className="flex min-h-fit flex-col overflow-visible">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Revenue trend
            </h2>
            <div className="min-h-fit overflow-visible">
              <RevenueTrendChart data={trendData} />
            </div>
          </div>
        );
      case "team_leaderboard":
        return showLeaderboard ? <TeamLeaderboard entries={leaderboard!} /> : null;
      default:
        return null;
    }
  };

  const gridWidgets = visibleIds
    .map((id) => {
      const content = renderWidget(id);
      if (!content) return null;
      return (
        <div
          key={id}
          className="flex min-h-fit flex-col overflow-visible rounded-2xl border border-slate-200 bg-surface p-4 shadow-sm"
        >
          {content}
        </div>
      );
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {gridWidgets.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gridWidgets}
        </div>
      )}

      <RecentDealsTable deals={deals} />
    </div>
  );
}
