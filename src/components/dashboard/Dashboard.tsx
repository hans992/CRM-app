"use client";

import { useEffect } from "react";
import { useDashboardPreferencesStore } from "@/stores/preferences";
import type { DashboardPreferences } from "@/lib/dashboard-preferences";
import type { DashboardLayout } from "@/lib/dashboard-preferences";
import { DashboardContent } from "./DashboardContent";
import type { Deal } from "@prisma/client";

type DealWithOwner = Deal & { owner: { id: string; name: string; email: string } | null };

interface DashboardProps {
  initialPreferences: DashboardPreferences;
  initialLayout: DashboardLayout | null;
  deals: DealWithOwner[];
  userRole: string;
  leaderboard: { userId: string; userName: string; totalClosedWonValue: number }[] | null;
  isLoading?: boolean;
}

export function Dashboard({
  initialPreferences,
  initialLayout,
  deals,
  userRole,
  leaderboard,
  isLoading,
}: DashboardProps) {
  const hydrate = useDashboardPreferencesStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(initialPreferences);
  }, [initialPreferences, hydrate]);

  return (
    <DashboardContent
      initialLayout={initialLayout}
      deals={deals}
      userRole={userRole}
      leaderboard={leaderboard}
      isLoading={isLoading}
    />
  );
}
