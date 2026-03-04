"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const taskStatuses = ["TODO", "IN_PROGRESS", "DONE"] as const;

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  status: z.enum(taskStatuses),
  assigneeId: z.string().min(1, "Assignee is required"),
  dealId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
});

export async function getTasks(filters?: {
  assigneeId?: string;
  status?: string;
  dealId?: string;
  contactId?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return [];

  const where: {
    assigneeId?: string;
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    dealId?: string | null;
    contactId?: string | null;
  } = {};

  if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters?.status) where.status = filters.status as "TODO" | "IN_PROGRESS" | "DONE";
  if (filters?.dealId !== undefined) where.dealId = filters.dealId || null;
  if (filters?.contactId !== undefined) where.contactId = filters.contactId || null;

  return prisma.task.findMany({
    where,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      deal: { select: { id: true, title: true, stage: true } },
      contact: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getUsersForAssign() {
  await getCurrentUser();
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
}

export async function createTask(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    status: (formData.get("status") as string) || "TODO",
    assigneeId: (formData.get("assigneeId") as string) || user.id,
    dealId: (formData.get("dealId") as string) || null,
    contactId: (formData.get("contactId") as string) || null,
  };
  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        status: parsed.data.status as "TODO" | "IN_PROGRESS" | "DONE",
        assigneeId: parsed.data.assigneeId,
        dealId: parsed.data.dealId || null,
        contactId: parsed.data.contactId || null,
      },
    });
    revalidatePath("/tasks");
    return {};
  } catch (e) {
    console.error("Create task error:", e);
    return { error: "Failed to create task" };
  }
}

export async function updateTask(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return { error: "Task not found" };

  const raw = {
    title: formData.get("title") as string | undefined,
    description: (formData.get("description") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    status: formData.get("status") as string | undefined,
    assigneeId: formData.get("assigneeId") as string | undefined,
  };
  const partial = z
    .object({
      title: z.string().min(1).max(300).optional(),
      description: z.string().max(2000).optional().nullable(),
      dueDate: z.string().optional().nullable(),
      status: z.enum(taskStatuses).optional(),
      assigneeId: z.string().min(1).optional(),
    })
    .safeParse(raw);

  if (!partial.success) {
    return { error: partial.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.task.update({
      where: { id },
      data: {
        ...(partial.data.title && { title: partial.data.title }),
        ...(partial.data.description !== undefined && { description: partial.data.description || null }),
        ...(partial.data.dueDate !== undefined && {
          dueDate: partial.data.dueDate ? new Date(partial.data.dueDate) : null,
        }),
        ...(partial.data.status && { status: partial.data.status as "TODO" | "IN_PROGRESS" | "DONE" }),
        ...(partial.data.assigneeId && { assigneeId: partial.data.assigneeId }),
      },
    });
    revalidatePath("/tasks");
    return {};
  } catch (e) {
    console.error("Update task error:", e);
    return { error: "Failed to update task" };
  }
}

export async function updateTaskStatus(
  id: string,
  status: "TODO" | "IN_PROGRESS" | "DONE"
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.task.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/tasks");
    return {};
  } catch (e) {
    console.error("Update task status error:", e);
    return { error: "Failed to update status" };
  }
}

export async function deleteTask(id: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath("/tasks");
    return {};
  } catch (e) {
    console.error("Delete task error:", e);
    return { error: "Failed to delete task" };
  }
}
