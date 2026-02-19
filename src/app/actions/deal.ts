"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createDeal(formData: FormData) {
  const title = formData.get("title") as string;
  const value = parseFloat(formData.get("value") as string);
  const stage = formData.get("stage") as string;
  const closeDate = formData.get("closeDate") as string;

  if (!title || !value || !stage) {
    return { error: "Missing required fields" };
  }

  try {
    await prisma.deal.create({
      data: {
        title,
        value,
        stage,
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
