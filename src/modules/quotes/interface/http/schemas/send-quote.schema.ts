import { z } from "zod";

export const sendQuoteParamsSchema = z.object({ id: z.uuid() });
export const sendQuoteResponseSchema = z.object({
  id: z.uuid(),
  status: z.literal("PENDING"),
  total: z.string(),
  expiresAt: z.date(),
});
