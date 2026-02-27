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
  "Digital Transformation Consulting",
  "Legacy System Modernization",
  "DevOps Pipeline Setup",
  "Multi-Cloud Migration",
  "Compliance Audit Software",
  "Fraud Detection Platform",
  "Real-Time Analytics Engine",
  "Customer Data Platform",
  "Sales Enablement Suite",
  "Partner Portal Integration",
  "Subscription Billing System",
  "Field Service Management",
  "Asset Tracking Solution",
  "Workflow Automation Hub",
  "Document Management System",
  "Video Conferencing Enterprise",
  "Zero Trust Security Stack",
  "Edge Computing Deployment",
  "IoT Monitoring Dashboard",
  "Predictive Maintenance Suite",
  "Talent Acquisition Platform",
  "Learning Management System",
  "Expense Management Tool",
  "Vendor Management Portal",
  "Contract Lifecycle Management",
  "Legal Document Automation",
  "Risk Assessment Platform",
  "Insurance Claims Processing",
  "Healthcare Data Integration",
  "Telemedicine Platform",
  "Pharmacy Management System",
];

const NOTE_SNIPPETS = [
  "Initial discovery call completed. Next steps: send proposal.",
  "Follow-up scheduled for next week.",
  "Proposal sent. Awaiting feedback.",
  "Contract reviewed by legal. Minor edits requested.",
  "Stakeholder presentation went well. Moving to negotiation.",
  "Pricing discussion in progress. Expecting decision by EOW.",
  "Technical deep-dive completed. Architecture approved.",
  "Reference call scheduled with existing customer.",
  "Renewal discussion started. Expansion opportunity identified.",
  "Champion confirmed. Working on procurement process.",
  "Demo delivered. Positive feedback from team.",
  "Security questionnaire submitted. Review in progress.",
  "Executive sponsor engaged. Aligning on timeline.",
  "Budget approved. Waiting on contract signature.",
  "Closed. Contract signed and kickoff scheduled.",
];

export async function runSeed(ownerIds?: string[]): Promise<{ success: true; count: number } | { success: false; error: string }> {
  try {
    let effectiveOwnerIds: string[];

    if (ownerIds && ownerIds.length > 0) {
      effectiveOwnerIds = ownerIds;
    } else {
      const defaultUser = await prisma.user.findFirst({
        where: { email: "demo@example.com" },
      });
      if (!defaultUser) {
        return { success: false, error: "Default user (demo@example.com) not found. Run full seed from CLI first." };
      }
      effectiveOwnerIds = [defaultUser.id];
    }

    await prisma.note.deleteMany({});
    await prisma.deal.deleteMany({});

    const stages = ["Closed Won", "Negotiating", "Lost", "Prospecting", "Qualified"];
    const now = new Date();
    const dealPayloads: Array<{
      title: string;
      value: number;
      stage: string;
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    const numDeals = 55;

    for (let i = 0; i < numDeals; i++) {
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

      const ownerId = effectiveOwnerIds[Math.floor(Math.random() * effectiveOwnerIds.length)]!;
      const title = DEAL_NAMES[i % DEAL_NAMES.length]! + (i >= DEAL_NAMES.length ? ` (${i + 1})` : "");

      dealPayloads.push({
        title,
        value,
        stage,
        ownerId,
        createdAt,
        updatedAt: createdAt,
      });
    }

    await prisma.deal.createMany({ data: dealPayloads });

    const createdDeals = await prisma.deal.findMany({
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const notesToCreate: Array<{ dealId: string; content: string; createdAt: Date }> = [];
    const snippetCount = NOTE_SNIPPETS.length;

    for (let d = 0; d < createdDeals.length; d++) {
      const deal = createdDeals[d]!;
      if (Math.random() > 0.35) {
        const numNotes = 1 + Math.floor(Math.random() * 2);
        const baseTime = new Date(deal.createdAt).getTime();
        for (let n = 0; n < numNotes; n++) {
          const noteCreated = new Date(baseTime + (n + 1) * 86400000 * (2 + Math.floor(Math.random() * 5)));
          notesToCreate.push({
            dealId: deal.id,
            content: NOTE_SNIPPETS[Math.floor(Math.random() * snippetCount)]!,
            createdAt: noteCreated,
          });
        }
      }
    }

    for (const note of notesToCreate) {
      await prisma.note.create({
        data: {
          dealId: note.dealId,
          content: note.content,
          createdAt: note.createdAt,
          updatedAt: note.createdAt,
        },
      });
    }

    return { success: true, count: dealPayloads.length };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error };
  }
}
