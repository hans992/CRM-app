import { TrendingUp, TrendingDown } from "lucide-react";
import type { TrendData } from "@/types";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendData;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  className = "",
}: KPICardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-slate-50 p-6 shadow-sm transition-all hover:shadow-lg hover:border-gray-300 ${className}`}
    >
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend.isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.percentage.toFixed(1)}%</span>
          </div>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}
