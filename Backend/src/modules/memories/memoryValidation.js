import { z } from "zod";

export const createTextMemorySchema = z.object({
  content: z.string().min(1).max(1000),
  type: z.literal("TEXT"),
});

export const createVoiceMemorySchema = z.object({
  audioUrl: z.string().url(),
  durationSecs: z.number().int().positive().optional(),
  type: z.literal("VOICE"),
});

export const listMemoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(["TEXT", "VOICE"]).optional(),
});
