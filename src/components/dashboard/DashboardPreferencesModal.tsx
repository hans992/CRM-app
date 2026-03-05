"use client";

import { useEffect, useState, useRef } from "react";
import { Settings, X } from "lucide-react";
import { useDashboardPreferencesStore } from "@/stores/preferences";
import { updateUserDashboardPreferences } from "@/app/actions/preferences";
import {
  type DashboardPreferences,
  DASHBOARD_WIDGET_IDS,
} from "@/lib/dashboard-preferences";

const WIDGET_LABELS: Record<keyof DashboardPreferences, string> = {
  show_total_deals: "Total Deals",
  show_total_value: "Total Value",
  show_avg_deal_value: "Avg Deal Value",
  show_deals_this_month: "Deals This Month",
  show_weighted_forecast: "Weighted Forecast",
  show_pipeline_health: "Pipeline health",
  show_revenue_trend: "Revenue trend",
  show_team_leaderboard: "Team leaderboard",
};

interface DashboardPreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardPreferencesModal({ open, onClose }: DashboardPreferencesModalProps) {
  const { preferences, setFullPreferences } = useDashboardPreferencesStore();
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState<DashboardPreferences>({ ...preferences });

  useEffect(() => {
    if (open) setLocal({ ...preferences });
  }, [open, preferences]);

  async function handleSave() {
    setSaving(true);
    setFullPreferences(local);
    const result = await updateUserDashboardPreferences(local);
    setSaving(false);
    if (!result.error) onClose();
  }

  function handleToggle(key: keyof DashboardPreferences, value: boolean) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="dashboard-prefs-title">
      <div className="absolute inset-0 bg-black/40" aria-hidden onClick={onClose} />
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="dashboard-prefs-title" className="text-lg font-semibold text-slate-900">Dashboard preferences</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Uncheck widgets to hide them from your dashboard.
        </p>
        <div className="space-y-3">
          {DASHBOARD_WIDGET_IDS.map((id) => (
            <label
              key={id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={local[id]}
                onChange={(e) => handleToggle(id, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-slate-700">{WIDGET_LABELS[id]}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardPreferencesButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        aria-label="Dashboard preferences"
      >
        <Settings className="h-4 w-4" />
        Customize dashboard
      </button>
      <DashboardPreferencesModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
