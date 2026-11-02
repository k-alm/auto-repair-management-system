import { z } from "zod";

export const createWorkOrderResponseSchema = z.object({
  id: z.uuid(),
  status: z.string(),
  createdAt: z.date(),
  quote: z.object({ id: z.uuid(), status: z.string(), total: z.string() }),
});
