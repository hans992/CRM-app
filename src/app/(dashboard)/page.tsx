import { Suspense, cache } from "react";
import { Dashboard, AddDealButton, DashboardPreferencesButton, PipelineKanban } from "@/components/dashboard";
import { DealsViewToggle } from "@/components/dashboard/DealsViewToggle";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { prisma } from "@/lib/prisma";
import { getDateRangeFilter, getStatusFilter } from "@/lib/filters";
import { getCurrentUser, canAccessAllDeals } from "@/lib/auth";
import { getUserDashboardPreferences, getDashboardLayout } from "@/app/actions/preferences";

interface HomeProps {
  searchParams: Promise<{ range?: string; status?: string; ownerId?: string; view?: string }>;
}

// Cache the deals query to prevent redundant database hits
const getDeals = cache(async (userId: string, userRole: string, dateFilter: ReturnType<typeof getDateRangeFilter>, statusFilter: string | undefined, ownerFilter?: string) => {
  const whereClause: {
    createdAt?: { gte: Date; lte: Date };
    stage?: string;
    ownerId?: string;
  } = {};

  if (dateFilter) {
    whereClause.createdAt = {
      gte: dateFilter.gte,
      lte: dateFilter.lte,
    };
  }

  if (statusFilter) {
    whereClause.stage = statusFilter;
  }

  // RBAC: SALES_REP only sees their own deals
  if (!canAccessAllDeals(userRole as any)) {
    whereClause.ownerId = userId;
  } else if (ownerFilter && ownerFilter !== "all") {
    // MANAGER/ADMIN can filter by owner
    whereClause.ownerId = ownerFilter;
  }

  return prisma.deal.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
});

async function getLeaderboard(): Promise<{ userId: string; userName: string; totalClosedWonValue: number }[]> {
  const rows = await prisma.deal.groupBy({
    by: ["ownerId"],
    where: { stage: "Closed Won", ownerId: { not: null } },
    _sum: { value: true },
  });
  const ownerIds = rows.map((r) => r.ownerId).filter(Boolean) as string[];
  if (ownerIds.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: ownerIds } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.name]));
  return rows
    .filter((r) => r.ownerId)
    .map((r) => ({
      userId: r.ownerId!,
      userName: userMap.get(r.ownerId!) ?? "Unknown",
      totalClosedWonValue: r._sum.value ?? 0,
    }))
    .sort((a, b) => b.totalClosedWonValue - a.totalClosedWonValue);
}

export default async function DealsPage({ searchParams }: HomeProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const range = params.range ?? "all";
  const status = params.status ?? "all";
  const ownerId = params.ownerId;
  const view = params.view === "board" ? "board" : "table";

  const dateFilter = getDateRangeFilter(range);
  const statusFilter = getStatusFilter(status);

  const deals = await getDeals(user.id, user.role, dateFilter, statusFilter, ownerId);

  const leaderboard =
    canAccessAllDeals(user.role as import("@/lib/auth").UserRole)
      ? await getLeaderboard()
      : null;

  const initialPreferences = await getUserDashboardPreferences();
  const initialLayout = await getDashboardLayout();

  return (
    <>
      <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Deals
        </h1>
        <div className="flex items-center gap-2">
          <DealsViewToggle />
          <DashboardPreferencesButton />
          <AddDealButton />
        </div>
      </header>

      <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-200" />}>
        <DashboardFilters />
      </Suspense>

      <div className="mt-6">
        {view === "board" ? (
          <PipelineKanban deals={deals} />
        ) : (
          <Dashboard
            initialPreferences={initialPreferences}
            initialLayout={initialLayout}
            deals={deals}
            userRole={user.role}
            leaderboard={leaderboard}
          />
        )}
      </div>
    </>
  );
}
