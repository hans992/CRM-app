import { TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import type { TrendData } from "@/types";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendData;
  target?: number;
  className?: string;
}

function ProgressRing({ percentage }: { percentage: number }) {
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedPercentage / 100) * circumference;
  const isComplete = normalizedPercentage >= 100;

  return (
    <div className="relative h-12 w-12">
      <svg className="h-12 w-12 -rotate-90 transform" viewBox="0 0 48 48">
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-500 ${
            isComplete
              ? "text-yellow-500"
              : normalizedPercentage >= 75
              ? "text-green-500"
              : normalizedPercentage >= 50
              ? "text-blue-500"
              : "text-amber-500"
          }`}
        />
      </svg>
      {isComplete && (
        <CheckCircle2 className="absolute inset-0 m-auto h-5 w-5 text-yellow-500" />
      )}
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
        {normalizedPercentage.toFixed(0)}%
      </span>
    </div>
  );
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  target,
  className = "",
}: KPICardProps) {
  let progressPercentage: number | undefined;
  let numericValue: number | undefined;

  if (target !== undefined) {
    // Extract numeric value from string or use number directly
    if (typeof value === "string") {
      // Remove currency symbols and parse
      numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    } else {
      numericValue = value;
    }

    if (numericValue !== undefined && !isNaN(numericValue) && target > 0) {
      progressPercentage = (numericValue / target) * 100;
    }
  }

  const isGoalMet = progressPercentage !== undefined && progressPercentage >= 100;

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-slate-50 p-6 shadow-sm transition-all hover:shadow-lg hover:border-gray-300 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
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
            {isGoalMet && (
              <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                <CheckCircle2 className="h-3 w-3" />
                <span>Goal Met</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
          {target !== undefined && progressPercentage !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <ProgressRing percentage={progressPercentage} />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Target: {typeof value === "string" ? value.replace(/\d+(\.\d+)?/, target.toLocaleString()) : target.toLocaleString()}</span>
                  <span className="font-medium">
                    {progressPercentage.toFixed(1)}% complete
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
