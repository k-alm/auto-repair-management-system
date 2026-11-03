import { z } from "zod";
import { QuoteStatus } from "../../../domain/quote-status";

export const sendQuoteParamsSchema = z.object({
  id: z.uuid(),
});
export const sendQuoteResponseSchema = z.object({
  id: z.uuid(),
  status: z.literal(QuoteStatus.PENDING),
  total: z.string(),
  expiresAt: z.date(),
});
