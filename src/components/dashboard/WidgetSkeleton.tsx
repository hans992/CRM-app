"use client";

/**
 * Skeleton placeholder for dashboard widgets during loading.
 * Uses the same h-full w-full flex flex-col p-4 structure as real widgets
 * so the grid layout does not collapse during the loading phase.
 */
export function WidgetSkeleton() {
  return (
    <div className="flex h-full w-full flex-col p-4">
      <div
        className="h-6 w-1/3 shrink-0 rounded animate-pulse bg-slate-200 dark:bg-slate-700"
        aria-hidden
      />
      <div
        className="mt-4 min-h-0 flex-1 w-full rounded-lg animate-pulse bg-slate-200 dark:bg-slate-700"
        aria-hidden
      />
    </div>
  );
}
