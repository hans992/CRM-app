"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  type DashboardPreferences,
  type DashboardLayout,
  DEFAULT_DASHBOARD_PREFERENCES,
  parseDashboardPreferences,
} from "@/lib/dashboard-preferences";

export async function getUserDashboardPreferences(): Promise<DashboardPreferences> {
  const user = await getCurrentUser();
  if (!user) return { ...DEFAULT_DASHBOARD_PREFERENCES };
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { dashboardPreferences: true },
  });
  return parseDashboardPreferences(dbUser?.dashboardPreferences ?? null);
}

export async function updateUserDashboardPreferences(
  preferences: Partial<DashboardPreferences>
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const current = await getUserDashboardPreferences();
  const next: DashboardPreferences = { ...current, ...preferences };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { dashboardPreferences: JSON.stringify(next) },
    });
    revalidatePath("/");
    return {};
  } catch (e) {
    console.error("Error updating dashboard preferences:", e);
    return { error: "Failed to save preferences" };
  }
}

export async function getDashboardLayout(): Promise<DashboardLayout | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { dashboardLayout: true },
  });
  if (!dbUser?.dashboardLayout) return null;
  try {
    return JSON.parse(dbUser.dashboardLayout) as DashboardLayout;
  } catch {
    return null;
  }
}

export async function updateDashboardLayout(layout: DashboardLayout): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { dashboardLayout: JSON.stringify(layout) },
    });
    revalidatePath("/");
    return {};
  } catch (e) {
    console.error("Error updating dashboard layout:", e);
    return { error: "Failed to save layout" };
  }
}
