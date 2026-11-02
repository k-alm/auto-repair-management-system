import { z } from "zod";

export const serviceResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(),
  estimatedMinutes: z.number().int(),
  isActive: z.boolean(),
});
