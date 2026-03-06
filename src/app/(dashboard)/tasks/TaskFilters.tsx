"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface TaskFiltersProps {
  users: { id: string; name: string; email: string }[];
}

export function TaskFilters({ users }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const assignee = searchParams.get("assignee") ?? "all";
  const status = searchParams.get("status") ?? "all";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="task-filter-status" className="text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="task-filter-status"
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

      <div className="flex items-center gap-2">
        <label htmlFor="task-filter-assignee" className="text-sm font-medium text-slate-700">
          Assignee
        </label>
        <select
          id="task-filter-assignee"
          value={assignee}
          onChange={(e) => updateFilter("assignee", e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
        >
          <option value="all">All</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
