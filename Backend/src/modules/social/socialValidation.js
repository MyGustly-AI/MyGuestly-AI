import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
