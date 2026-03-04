"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createDealSchema } from "@/lib/zod-schemas";
import { getCurrentUser } from "@/lib/auth";

export async function createDeal(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const rawData = {
    title: formData.get("title") as string,
    value: parseFloat(formData.get("value") as string),
    stage: formData.get("stage") as string,
    closeDate: formData.get("closeDate") as string,
    ownerId: user.id,
  };

  const validation = createDealSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || "Invalid input" };
  }

  const { title, value, stage, closeDate, ownerId } = validation.data;

  try {
    await prisma.deal.create({
      data: {
        title,
        value,
        stage,
        ownerId: ownerId || user.id, // Fallback to current user
        createdAt: closeDate ? new Date(closeDate) : new Date(),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating deal:", error);
    return { error: "Failed to create deal" };
  }
}

export async function updateDeal(dealId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify ownership (unless admin/manager)
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) {
    return { error: "Deal not found" };
  }

  if (deal.ownerId !== user.id && user.role !== "ADMIN" && user.role !== "MANAGER") {
    return { error: "You don't have permission to update this deal" };
  }

  const rawData = {
    dealId,
    title: formData.get("title") as string | undefined,
    value: formData.get("value") ? parseFloat(formData.get("value") as string) : undefined,
    stage: formData.get("stage") as string | undefined,
  };

  const validation = createDealSchema.partial().extend({ dealId: createDealSchema.shape.ownerId }).safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || "Invalid input" };
  }

  try {
    await prisma.deal.update({
      where: { id: dealId },
      data: {
        ...(validation.data.title && { title: validation.data.title }),
        ...(validation.data.value && { value: validation.data.value }),
        ...(validation.data.stage && { stage: validation.data.stage }),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating deal:", error);
    return { error: "Failed to update deal" };
  }
}

export async function updateDealStage(dealId: string, newStage: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) return { error: "Deal not found" };

  if (deal.ownerId !== user.id && user.role !== "ADMIN" && user.role !== "MANAGER") {
    return { error: "You don't have permission to update this deal" };
  }

  const validStages = ["Prospecting", "Qualified", "Negotiating", "Closed Won", "Lost"];
  if (!validStages.includes(newStage)) return { error: "Invalid stage" };

  try {
    await prisma.deal.update({
      where: { id: dealId },
      data: { stage: newStage },
    });
    revalidatePath("/");
    return {};
  } catch (e) {
    console.error("Error updating deal stage:", e);
    return { error: "Failed to update stage" };
  }
}
