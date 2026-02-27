"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { FunnelStage } from "@/lib/calculations";
import { ErrorBoundary } from "./ErrorBoundary";

interface PipelineFunnelChartProps {
  data: FunnelStage[];
}

const STAGE_COLORS: Record<string, string> = {
  Prospecting: "#f59e0b",
  Qualified: "#06b6d4",
  Negotiating: "#4f46e5",
  "Closed Won": "#22c55e",
  Lost: "#ef4444",
};

function formatCurrency(value: number) {
  if (!isFinite(value) || isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function ChartContent({ data }: PipelineFunnelChartProps) {
  const validData = data.filter(
    (item) =>
      item &&
      typeof item.stage === "string" &&
      typeof item.count === "number" &&
      isFinite(item.count) &&
      typeof item.value === "number" &&
      isFinite(item.value)
  );

  if (validData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-surface text-muted">
        No pipeline data to display
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={validData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 88, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => (isFinite(v) ? v.toString() : "0")}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="stage"
            width={88}
            tick={{ fontSize: 12, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [isFinite(value) ? value : 0, "Count"]}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as FunnelStage;
              if (!item || typeof item.stage !== "string") return null;
              return (
                <div className="rounded-xl border border-slate-200 bg-surface px-4 py-3 shadow-modal">
                  <p className="font-semibold text-slate-900">{item.stage}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.count} deals</p>
                  <p className="text-sm font-medium text-primary-600">{formatCurrency(item.value)} total value</p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32} isAnimationActive animationDuration={600}>
            {validData.map((entry) => (
              <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-surface text-muted">
          Unable to display chart. Please refresh the page.
        </div>
      }
    >
      <ChartContent data={data} />
    </ErrorBoundary>
  );
}
