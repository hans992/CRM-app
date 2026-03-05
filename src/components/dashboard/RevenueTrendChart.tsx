"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendSeriesPoint } from "@/lib/calculations";
import { ErrorBoundary } from "./ErrorBoundary";

interface RevenueTrendChartProps {
  data: TrendSeriesPoint[];
}

function formatCurrency(value: number) {
  if (!isFinite(value) || isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function ChartContent({ data }: RevenueTrendChartProps) {
  const validData = data.filter(
    (item) =>
      item &&
      typeof item.weekLabel === "string" &&
      typeof item.dealCount === "number" &&
      typeof item.totalValue === "number"
  );

  if (validData.length === 0) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 bg-surface py-8 text-muted">
        No trend data to display
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={validData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          <defs>
            <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="value"
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as TrendSeriesPoint;
              return (
                <div className="rounded-xl border border-slate-200 bg-surface px-4 py-3 shadow-modal">
                  <p className="text-sm font-semibold text-slate-900">{p.weekLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.dealCount} deals</p>
                  <p className="text-sm font-medium text-primary-600">{formatCurrency(p.totalValue)}</p>
                </div>
              );
            }}
          />
          <Area
            yAxisId="value"
            type="monotone"
            dataKey="totalValue"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="url(#fillValue)"
            isAnimationActive
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 bg-surface py-8 text-muted">
          Unable to display chart. Please refresh the page.
        </div>
      }
    >
      <ChartContent data={data} />
    </ErrorBoundary>
  );
}
