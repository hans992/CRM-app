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

  return prisma.deal.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
      },
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
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
          <p className="mt-2 text-gray-600">Please log in to access the dashboard.</p>
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

  const notes = deals.flatMap((deal) =>
    deal.notes.map((note) => ({
      dealId: deal.id,
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
    }))
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          CRM Dashboard
        </h1>
        <AddDealButton />
      </div>

      <Suspense fallback={<div className="h-10 animate-pulse rounded bg-gray-200" />}>
        <DashboardFilters />
      </Suspense>

      <div className="mt-6">
        <Dashboard deals={deals} notes={notes} />
      </div>
    </main>
  );
}
