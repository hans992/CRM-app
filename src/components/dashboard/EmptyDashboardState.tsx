"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Sparkles, Database } from "lucide-react";
import { AddDealButton } from "./AddDealButton";
import { importSampleData } from "@/app/actions/seed";

const QUICK_START_ITEMS: { id: string; label: string; done: boolean }[] = [
  { id: "deal", label: "Create your first deal", done: false },
  { id: "note", label: "Add a note to a deal", done: false },
  { id: "goal", label: "Set a sales goal", done: false },
];

export function EmptyDashboardState() {
  const [checklist, setChecklist] = useState(QUICK_START_ITEMS);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  function toggleCheck(id: string) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }

  async function handleImportSample() {
    setImporting(true);
    setImportError(null);
    const result = await importSampleData();
    setImporting(false);
    if (!result.success) {
      setImportError(result.error);
      return;
    }
    // Success: page will revalidate and show dashboard with data
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 rounded-2xl border border-slate-200 bg-surface p-8 shadow-card">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <Sparkles className="h-7 w-7 text-amber-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          Welcome to your CRM
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your pipeline is empty. Get started by adding deals or import sample
          data to explore the dashboard.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick Start
        </h3>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleCheck(item.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-surface-muted px-4 py-3 text-left transition-colors hover:bg-slate-100"
              >
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-slate-400" />
                )}
                <span
                  className={
                    item.done ? "text-muted-foreground line-through" : "text-slate-900"
                  }
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          1. Use &quot;Add Deal&quot; above. 2. Open a deal and add a note.
          3. Track goals in the KPI cards once you have data.
        </p>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={handleImportSample}
          disabled={importing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-500/50 bg-primary-50 px-4 py-4 text-sm font-medium text-primary-700 transition-colors hover:border-primary-500 hover:bg-primary-100 disabled:opacity-50"
        >
          <Database className="h-5 w-5" />
          {importing ? "Importing…" : "Import Sample Data"}
        </button>
        {importError && (
          <p className="mt-2 text-center text-sm text-red-600">{importError}</p>
        )}
      </div>

      <div className="flex justify-center pt-2">
        <AddDealButton />
      </div>
    </div>
  );
}
