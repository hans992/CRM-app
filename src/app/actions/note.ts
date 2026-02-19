"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "@/lib/zod-schemas";
import { getCurrentUser } from "@/lib/auth";

/** Fetch notes for a single deal (e.g. when opening Detail View). Avoids N+1 by not loading notes on the main list. */
export async function getNotesForDeal(dealId: string) {
  const user = await getCurrentUser();
  if (!user) return [];

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { ownerId: true },
  });
  if (!deal) return [];

  if (deal.ownerId !== user.id && user.role !== "ADMIN" && user.role !== "MANAGER") {
    return [];
  }

  const notes = await prisma.note.findMany({
    where: { dealId },
    orderBy: { createdAt: "desc" },
    select: { id: true, content: true, createdAt: true },
  });
  return notes;
}

export async function createNote(dealId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const validation = createNoteSchema.safeParse({ dealId, content });
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || "Invalid input" };
  }

  // Verify user can access this deal
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) {
    return { error: "Deal not found" };
  }

  if (deal.ownerId !== user.id && user.role !== "ADMIN" && user.role !== "MANAGER") {
    return { error: "You don't have permission to add notes to this deal" };
  }

  try {
    const note = await prisma.note.create({
      data: {
        dealId: validation.data.dealId,
        content: validation.data.content.trim(),
      },
    });

    revalidatePath("/");
    return {
      success: true,
      note: {
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
      },
    };
  } catch (error) {
    console.error("Error creating note:", error);
    return { error: "Failed to create note" };
  }
}
