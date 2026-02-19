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
  Negotiating: "#3b82f6",
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
  // Validate data structure
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
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500">
        No pipeline data to display
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-lg border border-gray-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={validData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tickFormatter={(v) => (isFinite(v) ? v.toString() : "0")} />
          <YAxis type="category" dataKey="stage" width={70} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [isFinite(value) ? value : 0, "Count"]}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as FunnelStage;
              if (!item || typeof item.stage !== "string") return null;
              return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                  <p className="font-medium text-gray-900">{item.stage}</p>
                  <p className="text-sm text-gray-600">{item.count} deals</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatCurrency(item.value)} total value
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {validData.map((entry) => (
              <Cell
                key={entry.stage}
                fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"}
              />
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
        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500">
          Unable to display chart. Please refresh the page.
        </div>
      }
    >
      <ChartContent data={data} />
    </ErrorBoundary>
  );
}
