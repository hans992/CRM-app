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

type DealWithOwner = Deal & { owner: { id: string; name: string; email: string } | null };

interface DashboardProps {
  deals: DealWithOwner[];
  userRole: string;
  leaderboard: { userId: string; userName: string; totalClosedWonValue: number }[] | null;
}

export function Dashboard({ deals, userRole, leaderboard }: DashboardProps) {
  if (deals.length === 0) {
    return <EmptyDashboardState />;
  }

  const kpiStart = typeof performance !== "undefined" ? performance.now() : 0;
  const metrics = calculateKPIMetrics(deals);
  const dealsLastMonth = calculateDealsLastMonth(deals);
  const valueLastMonth = calculateTotalValueLastMonth(deals);
  const funnelData = getFunnelData(deals);
  const trendData = getTrendSeriesByWeek(deals);
  const forecast = calculateForecast(deals);
  if (typeof performance !== "undefined" && process.env.NODE_ENV === "development") {
    const kpiMs = (performance.now() - kpiStart).toFixed(2);
    console.log(`[KPI Engine] Execution time: ${kpiMs}ms`);
  }

  const formatCurrency = (value: number) => {
    if (!isFinite(value) || isNaN(value)) return "$0.00";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Deals"
          value={metrics.totalDeals}
          trend={calculateTrend(metrics.totalDeals, deals.length - metrics.dealsThisMonth)}
          delayMs={0}
        />
        <KPICard
          title="Total Value"
          value={formatCurrency(metrics.totalValue)}
          subtitle="Pipeline value"
          trend={calculateTrend(metrics.totalValue, metrics.totalValue - valueLastMonth)}
          target={100000}
          delayMs={50}
        />
        <KPICard
          title="Avg Deal Value"
          value={formatCurrency(metrics.averageDealValue)}
          delayMs={100}
        />
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Weighted Forecast"
          value={formatCurrency(forecast)}
          subtitle="Expected revenue"
          target={70000}
          className="lg:col-span-1"
          delayMs={200}
        />
      </div>

      {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && leaderboard && (
        <TeamLeaderboard entries={leaderboard} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Pipeline health</h2>
          {funnelData.length > 0 ? (
            <PipelineFunnelChart data={funnelData} />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-surface text-muted">
              <p className="text-sm">No data for this period</p>
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Revenue trend</h2>
          <RevenueTrendChart data={trendData} />
        </div>
      </div>

      <RecentDealsTable deals={deals} />
    </div>
  );
}
