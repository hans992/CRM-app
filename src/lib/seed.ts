/**
 * Reusable seed logic for the CRM database.
 * Used by prisma/seed.ts (CLI) and by the "Import Sample Data" server action.
 */

import { prisma } from "./prisma";

const DEAL_NAMES = [
  "Enterprise Software License",
  "Cloud Infrastructure Contract",
  "Marketing Automation Platform",
  "CRM Implementation",
  "Data Analytics Suite",
  "Security Compliance Package",
  "Customer Support Tools",
  "E-commerce Integration",
  "Mobile App Development",
  "API Integration Services",
  "Content Management System",
  "Business Intelligence Dashboard",
  "Email Marketing Platform",
  "Project Management Tools",
  "HR Management System",
  "Financial Software License",
  "Inventory Management",
  "Supply Chain Solution",
  "Customer Portal Development",
  "AI Chatbot Implementation",
];

export async function runSeed(): Promise<{ success: true; count: number } | { success: false; error: string }> {
  try {
    const defaultUser = await prisma.user.findFirst({
      where: { email: "demo@example.com" },
    });

    if (!defaultUser) {
      return { success: false, error: "Default user (demo@example.com) not found. Run full seed from CLI first." };
    }

    await prisma.deal.deleteMany({});

    const stages = ["Closed Won", "Negotiating", "Lost", "Prospecting", "Qualified"];
    const now = new Date();
    const deals: Array<{
      title: string;
      value: number;
      stage: string;
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    for (let i = 0; i < 20; i++) {
      const monthsAgo = Math.floor(Math.random() * 3);
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(now);
      createdAt.setMonth(now.getMonth() - monthsAgo);
      createdAt.setDate(now.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));

      const value = Math.floor(Math.random() * 9000) + 1000;
      const rand = Math.random();
      let stage: string;
      if (rand < 0.3) stage = "Closed Won";
      else if (rand < 0.6) stage = "Negotiating";
      else if (rand < 0.75) stage = "Prospecting";
      else if (rand < 0.9) stage = "Qualified";
      else stage = "Lost";

      deals.push({
        title: DEAL_NAMES[i],
        value,
        stage,
        ownerId: defaultUser.id,
        createdAt,
        updatedAt: createdAt,
      });
    }

    await prisma.deal.createMany({ data: deals });
    return { success: true, count: deals.length };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error };
  }
}
