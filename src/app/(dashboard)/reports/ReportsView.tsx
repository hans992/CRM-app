"use client";

import { useEffect } from "react";
import { useDashboardPreferencesStore } from "@/stores/preferences";
import { DEFAULT_DASHBOARD_PREFERENCES } from "@/lib/dashboard-preferences";
import { DashboardContent } from "@/components/dashboard";
import type { Deal } from "@prisma/client";

type DealWithOwner = Deal & { owner: { id: string; name: string; email: string } | null };

interface ReportsViewProps {
  deals: DealWithOwner[];
  userRole: string;
  leaderboard: { userId: string; userName: string; totalClosedWonValue: number }[] | null;
}

export function ReportsView({ deals, userRole, leaderboard }: ReportsViewProps) {
  const hydrate = useDashboardPreferencesStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(DEFAULT_DASHBOARD_PREFERENCES);
  }, [hydrate]);

  return (
    <DashboardContent
      initialLayout={null}
      deals={deals}
      userRole={userRole}
      leaderboard={leaderboard}
    />
  );
}
