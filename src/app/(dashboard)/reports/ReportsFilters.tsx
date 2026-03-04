"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

const DATE_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "This Quarter" },
  { value: "prev90d", label: "Last Quarter" },
  { value: "all", label: "All time" },
] as const;

const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "Prospecting", label: "Prospecting" },
  { value: "Qualified", label: "Qualified" },
  { value: "Negotiating", label: "Negotiating" },
  { value: "Closed Won", label: "Closed Won" },
  { value: "Lost", label: "Lost" },
] as const;

interface ReportsFiltersProps {
  defaultRange: string;
  defaultStatus: string;
  defaultOwnerId?: string;
}

export function ReportsFilters({ defaultRange, defaultStatus, defaultOwnerId }: ReportsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRange = searchParams.get("range") ?? defaultRange;
  const currentStatus = searchParams.get("status") ?? defaultStatus;
  const currentOwner = searchParams.get("ownerId") ?? defaultOwnerId ?? "all";

  function updateFilters(range: string, status: string, ownerId?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (range && range !== "all") params.set("range", range);
    else params.delete("range");
    if (status && status !== "all") params.set("status", status);
    else params.delete("status");
    if (ownerId && ownerId !== "all") params.set("ownerId", ownerId);
    else params.delete("ownerId");
    router.push(`/reports?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="reports-range" className="text-sm text-muted-foreground">
            Date range:
          </label>
          <select
            id="reports-range"
            value={currentRange}
            onChange={(e) => updateFilters(e.target.value, currentStatus, currentOwner)}
            className="rounded-lg border border-slate-300 bg-surface px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {DATE_RANGES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="reports-status" className="text-sm text-muted-foreground">
            Status:
          </label>
          <select
            id="reports-status"
            value={currentStatus}
            onChange={(e) => updateFilters(currentRange, e.target.value, currentOwner)}
            className="rounded-lg border border-slate-300 bg-surface px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
