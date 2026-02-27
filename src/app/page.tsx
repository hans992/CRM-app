import { Suspense, cache } from "react";
import { Dashboard, AddDealButton } from "@/components/dashboard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { prisma } from "@/lib/prisma";
import { getDateRangeFilter, getStatusFilter } from "@/lib/filters";
import { getCurrentUser, canAccessAllDeals } from "@/lib/auth";

interface HomeProps {
  searchParams: Promise<{ range?: string; status?: string; ownerId?: string }>;
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
  // Note: If ownerId is null (legacy deals), they're visible to all roles for now

  // Include only owner for list display; notes are fetched on demand when opening Detail View to avoid N+1
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

export default async function Home({ searchParams }: HomeProps) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Unauthorized</h1>
          <p className="mt-2 text-muted-foreground">Please log in to access the dashboard.</p>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const range = params.range ?? "all";
  const status = params.status ?? "all";
  const ownerId = params.ownerId;

  const dateFilter = getDateRangeFilter(range);
  const statusFilter = getStatusFilter(status);

  const deals = await getDeals(user.id, user.role, dateFilter, statusFilter, ownerId);

  const leaderboard =
    canAccessAllDeals(user.role as import("@/lib/auth").UserRole)
      ? await getLeaderboard()
      : null;

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">C</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            CRM Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {user.name}
          </span>
          <AddDealButton />
        </div>
      </header>

      <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-slate-200" />}>
        <DashboardFilters />
      </Suspense>

      <div className="mt-6">
        <Dashboard deals={deals} userRole={user.role} leaderboard={leaderboard} />
      </div>
    </main>
  );
}
