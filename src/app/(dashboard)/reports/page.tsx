import { Suspense, cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canAccessAllDeals } from "@/lib/auth";
import { getDateRangeFilter, getStatusFilter } from "@/lib/filters";
import { ReportsFilters } from "./ReportsFilters";
import { getDashboardLayout, getUserDashboardPreferences } from "@/app/actions/preferences";
import { Dashboard } from "@/components/dashboard";

const getDeals = cache(
  async (
    userId: string,
    userRole: string,
    dateFilter: ReturnType<typeof getDateRangeFilter>,
    statusFilter: string | undefined,
    ownerFilter?: string
  ) => {
    const whereClause: {
      createdAt?: { gte: Date; lte: Date };
      stage?: string;
      ownerId?: string;
    } = {};

    if (dateFilter) {
      whereClause.createdAt = { gte: dateFilter.gte, lte: dateFilter.lte };
    }
    if (statusFilter) whereClause.stage = statusFilter;
    if (!canAccessAllDeals(userRole as import("@/lib/auth").UserRole)) {
      whereClause.ownerId = userId;
    } else if (ownerFilter && ownerFilter !== "all") {
      whereClause.ownerId = ownerFilter;
    }

    return prisma.deal.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
);

async function getLeaderboard() {
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

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; status?: string; ownerId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const range = params.range ?? "30d";
  const status = params.status ?? "all";
  const ownerId = params.ownerId;

  const dateFilter = getDateRangeFilter(range);
  const statusFilter = getStatusFilter(status);

  const deals = await getDeals(user.id, user.role, dateFilter, statusFilter, ownerId);
  const leaderboard = canAccessAllDeals(user.role as import("@/lib/auth").UserRole)
    ? await getLeaderboard()
    : null;

  const initialPreferences = await getUserDashboardPreferences();
  const initialLayout = await getDashboardLayout();

  return (
    <>
      <header className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          KPIs, pipeline health, revenue trend, and team performance.
        </p>
      </header>

      <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-200" />}>
        <ReportsFilters defaultRange={range} defaultStatus={status} defaultOwnerId={ownerId} />
      </Suspense>

      <div className="mt-6">
        <Dashboard
          deals={deals}
          userRole={user.role}
          leaderboard={leaderboard}
          initialPreferences={initialPreferences}
          initialLayout={initialLayout}
          showRecentDealsTable={false}
          gridDisabled
          persistLayout={false}
        />
      </div>
    </>
  );
}
