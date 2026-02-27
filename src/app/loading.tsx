export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="mb-6 h-10 w-full max-w-md animate-pulse rounded-lg bg-slate-200" />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-surface"
          />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-surface" />
        </div>
        <div>
          <div className="mb-3 h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-surface" />
        </div>
      </div>

      <div>
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-surface" />
      </div>
    </main>
  );
}
