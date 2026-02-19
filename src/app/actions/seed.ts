"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { runSeed } from "@/lib/seed";

export async function importSampleData(): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await runSeed();
  if (result.success) {
    revalidatePath("/");
  }
  return result;
}
