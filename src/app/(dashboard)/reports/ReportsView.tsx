"use client";

import { useEffect } from "react";
import { useDashboardPreferencesStore } from "@/stores/preferences";
import type { DashboardPreferences, DashboardLayout } from "@/lib/dashboard-preferences";
import { DashboardContent } from "@/components/dashboard";
import type { Deal } from "@prisma/client";

type DealWithOwner = Deal & { owner: { id: string; name: string; email: string } | null };

interface ReportsViewProps {
  deals: DealWithOwner[];
  userRole: string;
  leaderboard: { userId: string; userName: string; totalClosedWonValue: number }[] | null;
  initialPreferences: DashboardPreferences;
  initialLayout: DashboardLayout | null;
}

export function ReportsView({ deals, userRole, leaderboard, initialPreferences, initialLayout }: ReportsViewProps) {
  const hydrate = useDashboardPreferencesStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(initialPreferences);
  }, [hydrate, initialPreferences]);

  return (
    <DashboardContent
      initialLayout={initialLayout}
      deals={deals}
      userRole={userRole}
      leaderboard={leaderboard}
      showRecentDealsTable={false}
      persistLayout={false}
      gridDisabled
    />
  );
}
