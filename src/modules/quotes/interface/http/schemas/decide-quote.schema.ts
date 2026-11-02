import { z } from "zod";

export const decideQuoteParamsSchema = z.object({ id: z.uuid() });
export const decideQuoteHeadersSchema = z.object({
  "x-approval-token": z.string().min(20),
});
export const decideQuoteBodySchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
});
export const decideQuoteResponseSchema = z.object({
  expired: z.literal(false),
  authorizationId: z.uuid(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  decidedAt: z.date(),
  workOrderStatus: z.string(),
});
