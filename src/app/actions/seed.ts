"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed";

export async function importSampleData(): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const userIds = (await prisma.user.findMany({ select: { id: true } })).map((u) => u.id);
  const result = await runSeed(userIds.length > 0 ? userIds : undefined);
  if (result.success) {
    revalidatePath("/");
  }
  return result;
}
