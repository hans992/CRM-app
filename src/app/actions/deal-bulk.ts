"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { bulkDeleteDealsSchema, bulkUpdateDealStatusSchema } from "@/lib/zod-schemas";
import { getCurrentUser } from "@/lib/auth";

export async function bulkDeleteDeals(dealIds: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const validation = bulkDeleteDealsSchema.safeParse({ dealIds });
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || "Invalid input" };
  }

  try {
    // Build where clause based on role
    const whereClause: { id: { in: string[] }; ownerId?: string } = {
      id: { in: validation.data.dealIds },
    };

    // SALES_REP can only delete their own deals
    if (user.role === "SALES_REP") {
      whereClause.ownerId = user.id;
    }

    // Verify all deals exist and user has permission
    const deals = await prisma.deal.findMany({
      where: { id: { in: validation.data.dealIds } },
      select: { id: true, ownerId: true },
    });

    if (deals.length !== validation.data.dealIds.length) {
      return { error: "Some deals not found" };
    }

    if (user.role === "SALES_REP") {
      const unauthorized = deals.some((d) => d.ownerId !== user.id);
      if (unauthorized) {
        return { error: "You don't have permission to delete some of these deals" };
      }
    }

    await prisma.deal.deleteMany({
      where: whereClause,
    });

    revalidatePath("/");
    return { success: true, deleted: deals.length };
  } catch (error) {
    console.error("Error deleting deals:", error);
    return { error: "Failed to delete deals" };
  }
}

export async function bulkUpdateDealStatus(dealIds: string[], newStatus: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const validation = bulkUpdateDealStatusSchema.safeParse({ dealIds, newStatus });
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || "Invalid input" };
  }

  try {
    // Build where clause based on role
    const whereClause: { id: { in: string[] }; ownerId?: string } = {
      id: { in: validation.data.dealIds },
    };

    // SALES_REP can only update their own deals
    if (user.role === "SALES_REP") {
      whereClause.ownerId = user.id;
    }

    // Verify all deals exist and user has permission
    const deals = await prisma.deal.findMany({
      where: { id: { in: validation.data.dealIds } },
      select: { id: true, ownerId: true },
    });

    if (deals.length !== validation.data.dealIds.length) {
      return { error: "Some deals not found" };
    }

    if (user.role === "SALES_REP") {
      const unauthorized = deals.some((d) => d.ownerId !== user.id);
      if (unauthorized) {
        return { error: "You don't have permission to update some of these deals" };
      }
    }

    await prisma.deal.updateMany({
      where: whereClause,
      data: {
        stage: validation.data.newStatus,
      },
    });

    revalidatePath("/");
    return { success: true, updated: deals.length };
  } catch (error) {
    console.error("Error updating deals:", error);
    return { error: "Failed to update deals" };
  }
}
