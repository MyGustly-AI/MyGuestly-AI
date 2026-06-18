import { z } from "zod";

export const retagSchema = z.object({
  eventId: z.string().uuid(),
});
