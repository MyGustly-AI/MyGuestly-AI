import { z } from "zod";

export const getUploadUrlSchema = z.object({
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  fileSizeBytes: z.number().int().positive(),
});

export const confirmUploadSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  mediaType: z.enum(["IMAGE", "VIDEO", "AUDIO"]),
  size: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
});

export const listMediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  mediaType: z.enum(["IMAGE", "VIDEO", "AUDIO"]).optional(),
  tag: z.string().optional(),
});
