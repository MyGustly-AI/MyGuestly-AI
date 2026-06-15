import { z } from "zod";

export const rsvpSchema = z.object({
  status: z.enum(["YES", "NO", "MAYBE"]),
});
