import { z } from "zod";

export const transitionWorkOrderResponseSchema = z.object({
  id: z.uuid(),
  from: z.string(),
  status: z.string(),
});
