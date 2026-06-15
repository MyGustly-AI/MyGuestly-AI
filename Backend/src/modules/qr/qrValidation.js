import { z } from "zod";

export const scanSchema = z.object({
  token: z.string().min(1),
  eventId: z.string().uuid(),
});
