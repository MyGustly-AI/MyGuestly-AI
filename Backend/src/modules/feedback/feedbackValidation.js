import { z } from "zod";

export const createFeedbackSchema = z.object({
  guestId: z.string().uuid(),
  rating: z.number().int().min(1).max(5).default(5),
  comment: z.string().max(2000).optional(),
  category: z.enum(["GENERAL", "VENUE", "CATERING", "ENTERTAINMENT", "ORGANIZATION"]).default("GENERAL"),
});

export const listFeedbackQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
