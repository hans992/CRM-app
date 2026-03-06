import { z } from "zod";

/** Stages allowed for deals (shared with server and form) */
export const DEAL_STAGES = [
  "Prospecting",
  "Qualified",
  "Negotiating",
  "Closed Won",
  "Lost",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

/** Client-side deal form schema with user-friendly messages. Value is string from input, coerced to number. */
export const dealFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Deal name is required" })
    .max(200, { message: "Deal name must be 200 characters or less" }),
  value: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((s) => {
      const n = parseFloat(s);
      return !Number.isNaN(n) && n > 0;
    }, { message: "Amount must be greater than 0" }),
  stage: z
    .string()
    .min(1, { message: "Please select a stage" })
    .refine((s) => DEAL_STAGES.includes(s as DealStage), {
      message: "Please select a valid stage",
    }),
  closeDate: z.string().optional(),
});

export type DealFormValues = z.infer<typeof dealFormSchema>;

/** Client-side contact form schema with user-friendly messages. */
export const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(200, { message: "Name must be 200 characters or less" }),
  email: z.string().min(1, { message: "Email is required" }).email("Invalid email address"),
  phone: z.string().max(50, { message: "Phone must be 50 characters or less" }).optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/** Task status options for the form */
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Client-side task form schema with user-friendly messages. */
export const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(300, { message: "Title must be 300 characters or less" }),
  description: z.string().max(2000, { message: "Description must be 2000 characters or less" }).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  status: z.enum(TASK_STATUSES, {
    required_error: "Please select a status",
    invalid_type_error: "Please select a valid status",
  }),
  assigneeId: z.string().min(1, { message: "Please select an assignee" }),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

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
