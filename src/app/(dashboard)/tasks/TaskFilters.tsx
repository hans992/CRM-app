"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TaskFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const assignee = searchParams.get("assignee") ?? "all";
  const status = searchParams.get("status") ?? "all";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    router.push(`/tasks?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Status</label>
        <select
          value={status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
        >
          <option value="all">All</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>
  );
}
