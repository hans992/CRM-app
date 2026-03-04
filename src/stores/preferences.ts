"use client";

import { create } from "zustand";
import type { DashboardPreferences } from "@/lib/dashboard-preferences";
import { DEFAULT_DASHBOARD_PREFERENCES } from "@/lib/dashboard-preferences";

interface PreferencesState {
  preferences: DashboardPreferences;
  hydrated: boolean;
  setPreferences: (prefs: Partial<DashboardPreferences>) => void;
  setFullPreferences: (prefs: DashboardPreferences) => void;
  hydrate: (prefs: DashboardPreferences) => void;
  reset: () => void;
}

export const useDashboardPreferencesStore = create<PreferencesState>((set) => ({
  preferences: { ...DEFAULT_DASHBOARD_PREFERENCES },
  hydrated: false,
  setPreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),
  setFullPreferences: (prefs) => set({ preferences: prefs }),
  hydrate: (prefs) => set({ preferences: prefs, hydrated: true }),
  reset: () => set({ preferences: { ...DEFAULT_DASHBOARD_PREFERENCES } }),
}));
