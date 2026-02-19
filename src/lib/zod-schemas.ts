import { z } from "zod";

export const createDealSchema = z.object({
  title: z.string().min(1, "Deal name is required").max(200),
  value: z.number().positive("Amount must be positive"),
  stage: z.enum(["Prospecting", "Qualified", "Negotiating", "Closed Won", "Lost"]),
  closeDate: z.string().optional(),
  ownerId: z.string().min(1, "Owner ID is required"),
});

export const createNoteSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  content: z.string().min(1, "Note content is required").max(1000),
});

export const bulkDeleteDealsSchema = z.object({
  dealIds: z.array(z.string().min(1)).min(1, "At least one deal must be selected"),
});

export const bulkUpdateDealStatusSchema = z.object({
  dealIds: z.array(z.string().min(1)).min(1, "At least one deal must be selected"),
  newStatus: z.enum(["Prospecting", "Qualified", "Negotiating", "Closed Won", "Lost"]),
});

export const updateDealSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  title: z.string().min(1).max(200).optional(),
  value: z.number().positive().optional(),
  stage: z.enum(["Prospecting", "Qualified", "Negotiating", "Closed Won", "Lost"]).optional(),
});
