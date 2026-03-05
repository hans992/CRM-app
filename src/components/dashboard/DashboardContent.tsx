"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { Layout } from "react-grid-layout";
import { KPICard } from "./KPICard";
import { RecentDealsTable } from "./RecentDealsTable";
import { PipelineFunnelChart } from "./PipelineFunnelChart";
import { RevenueTrendChart } from "./RevenueTrendChart";
import { EmptyDashboardState } from "./EmptyDashboardState";
import { TeamLeaderboard } from "./TeamLeaderboard";
import { DashboardGrid } from "./DashboardGrid";
import { WidgetSkeleton } from "./WidgetSkeleton";
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
  getDefaultDashboardLayout,
  type GridWidgetId,
  type DashboardLayout,
} from "@/lib/dashboard-preferences";

type DealWithOwner = Deal & { owner: { id: string; name: string; email: string } | null };

interface DashboardContentProps {
  initialLayout: DashboardLayout | null;
  deals: DealWithOwner[];
  userRole: string;
  leaderboard: { userId: string; userName: string; totalClosedWonValue: number }[] | null;
  /** When true, show skeleton placeholders instead of data (e.g. while fetching from Zustand/React Query). */
  isLoading?: boolean;
}

export function DashboardContent({
  initialLayout,
  deals,
  userRole,
  leaderboard,
  isLoading = false,
}: DashboardContentProps) {
  const preferences = useDashboardPreferencesStore((s) => s.preferences);
  const visibleIds = useMemo(
    () => getVisibleGridWidgetIds(preferences),
    [preferences]
  );

  const initialLayoutState = useMemo(() => {
    const ids = getVisibleGridWidgetIds(preferences);
    if (
      initialLayout &&
      Array.isArray(initialLayout) &&
      initialLayout.length > 0
    ) {
      const filtered = initialLayout.filter((item: { i: string }) =>
        ids.includes(item.i as GridWidgetId)
      );
      if (filtered.length > 0) return filtered as Layout;
    }
    return getDefaultDashboardLayout(ids) as Layout;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- initial layout once

  const [layout, setLayout] = useState<Layout>(initialLayoutState);
  const hasSyncedVisibility = useRef(false);

  useEffect(() => {
    if (!hasSyncedVisibility.current) {
      hasSyncedVisibility.current = true;
      return;
    }
    setLayout(getDefaultDashboardLayout(visibleIds) as Layout);
  }, [visibleIds.join(",")]);

  if (isLoading) {
    const skeletonLayout = layout.length > 0 ? layout : initialLayoutState;
    return (
      <div className="space-y-6">
        <DashboardGrid
          layout={skeletonLayout}
          onLayoutChange={() => {}}
          disabled
        >
          {skeletonLayout.map((item) => (
            <div
              key={item.i}
              className="h-full w-full flex flex-col rounded-2xl border border-slate-200 bg-surface p-4 shadow-sm"
            >
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <WidgetSkeleton />
              </div>
            </div>
          ))}
        </DashboardGrid>
      </div>
    );
  }

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
          <div className="flex h-full min-h-0 flex-col">
            <h2 className="mb-2 shrink-0 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pipeline health
            </h2>
            <div className="flex-1 min-h-0">
              {funnelData.length > 0 ? (
                <PipelineFunnelChart data={funnelData} />
              ) : (
                <div className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-slate-200 bg-surface py-8 text-muted">
                  <p className="text-sm">No data for this period</p>
                </div>
              )}
            </div>
          </div>
        );
      case "revenue_trend":
        return (
          <div className="flex h-full min-h-0 flex-col">
            <h2 className="mb-2 shrink-0 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Revenue trend
            </h2>
            <div className="flex-1 min-h-0">
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

  const gridWidgets = layout.map((item) => {
    const content = renderWidget(item.i as GridWidgetId);
    return (
      <div
        key={item.i}
        className="h-full w-full flex flex-col rounded-2xl border border-slate-200 bg-surface p-4 shadow-sm"
      >
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {content || <div className="min-h-[80px]" aria-hidden />}
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-6">
      {gridWidgets.length > 0 && (
        <DashboardGrid
          layout={layout}
          onLayoutChange={(newLayout) => setLayout(newLayout)}
        >
          {gridWidgets}
        </DashboardGrid>
      )}

      <RecentDealsTable deals={deals} />
    </div>
  );
}
