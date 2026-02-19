import { KPICard } from "./KPICard";
import { RecentDealsTable } from "./RecentDealsTable";
import { PipelineFunnelChart } from "./PipelineFunnelChart";
import { EmptyDashboardState } from "./EmptyDashboardState";
import { TeamLeaderboard } from "./TeamLeaderboard";
import {
  calculateKPIMetrics,
  calculateTrend,
  calculateDealsLastMonth,
  calculateTotalValueLastMonth,
  getFunnelData,
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
        />
        <KPICard
          title="Total Value"
          value={formatCurrency(metrics.totalValue)}
          subtitle="Pipeline value"
          trend={calculateTrend(metrics.totalValue, metrics.totalValue - valueLastMonth)}
          target={100000} // Example: $100k target
        />
        <KPICard
          title="Avg Deal Value"
          value={formatCurrency(metrics.averageDealValue)}
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
          target={15} // Example: 15 deals per month target
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Weighted Forecast"
          value={formatCurrency(forecast)}
          subtitle="Expected revenue"
          target={70000} // Example: $70k forecast target
          className="lg:col-span-1"
        />
      </div>

      {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && leaderboard && (
        <TeamLeaderboard entries={leaderboard} />
      )}

      {funnelData.length > 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Pipeline Health</h2>
          <PipelineFunnelChart data={funnelData} />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">No data for this period</p>
        </div>
      )}

      <RecentDealsTable deals={deals} />
    </div>
  );
}
