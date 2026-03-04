"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email"),
  phone: z.string().max(50).optional().or(z.literal("")),
  companyId: z.string().optional().nullable(),
});

export async function getContacts(search?: string) {
  await getCurrentUser();
  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {};
  return prisma.contact.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      company: { select: { id: true, name: true } },
      _count: { select: { deals: true } },
    },
  });
}

export async function getContactById(id: string) {
  await getCurrentUser();
  return prisma.contact.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      deals: {
        orderBy: { updatedAt: "desc" },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          notes: { orderBy: { createdAt: "desc" }, take: 20 },
        },
      },
    },
  });
}

export async function createContact(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    companyId: (formData.get("companyId") as string) || null,
  };
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.contact.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        companyId: parsed.data.companyId || null,
      },
    });
    revalidatePath("/contacts");
    return {};
  } catch (e) {
    console.error("Create contact error:", e);
    return { error: "Failed to create contact" };
  }
}

export async function updateContact(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    companyId: (formData.get("companyId") as string) || null,
  };
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.contact.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        companyId: parsed.data.companyId || null,
      },
    });
    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);
    return {};
  } catch (e) {
    console.error("Update contact error:", e);
    return { error: "Failed to update contact" };
  }
}

export async function deleteContact(id: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.contact.delete({ where: { id } });
    revalidatePath("/contacts");
    return {};
  } catch (e) {
    console.error("Delete contact error:", e);
    return { error: "Failed to delete contact" };
  }
}

export async function getCompanies() {
  await getCurrentUser();
  return prisma.company.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createCompany(name: string): Promise<{ error?: string; id?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  if (!name?.trim()) return { error: "Company name is required" };
  try {
    const company = await prisma.company.create({
      data: { name: name.trim() },
    });
    revalidatePath("/contacts");
    return { id: company.id };
  } catch (e) {
    console.error("Create company error:", e);
    return { error: "Failed to create company" };
  }
}
