import { KPICard } from "./KPICard";
import { calculateKPIMetrics } from "@/lib/calculations";
import type { Deal } from "@prisma/client";

interface DashboardProps {
  deals: Deal[];
}

export function Dashboard({ deals }: DashboardProps) {
  const metrics = calculateKPIMetrics(deals);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Deals" value={metrics.totalDeals} />
        <KPICard
          title="Total Value"
          value={formatCurrency(metrics.totalValue)}
          subtitle="Pipeline value"
        />
        <KPICard
          title="Avg Deal Value"
          value={formatCurrency(metrics.averageDealValue)}
        />
        <KPICard
          title="Deals This Month"
          value={metrics.dealsThisMonth}
          subtitle={metrics.conversionRate !== undefined ? `${metrics.conversionRate.toFixed(1)}% conversion` : undefined}
        />
      </div>
    </div>
  );
}
