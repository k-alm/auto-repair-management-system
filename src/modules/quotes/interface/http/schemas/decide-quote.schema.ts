import { z } from "zod";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";
import { QuoteStatus } from "../../../domain/quote-status";

export const decideQuoteParamsSchema = z.object({
  id: z.uuid(),
});
export const decideQuoteHeadersSchema = z.object({
  "x-approval-token": z.string().min(20),
});
export const decideQuoteBodySchema = z.object({
  decision: z.enum([QuoteStatus.APPROVED, QuoteStatus.REJECTED]),
});
export const decideQuoteResponseSchema = z.object({
  expired: z.literal(false),
  authorizationId: z.uuid(),
  decision: z.enum([QuoteStatus.APPROVED, QuoteStatus.REJECTED]),
  decidedAt: z.date(),
  workOrderStatus: z.enum([WorkOrderStatus.EM_EXECUCAO, WorkOrderStatus.CANCELADA]),
});
