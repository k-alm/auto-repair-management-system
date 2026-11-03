import { z } from "zod";
import { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import { WorkOrderStatus } from "../../../domain/work-order-status";

export const createWorkOrderResponseSchema = z.object({
  id: z.uuid(),
  status: z.enum(WorkOrderStatus),
  createdAt: z.date(),
  quote: z.object({ id: z.uuid(), status: z.enum(QuoteStatus), total: z.string() }),
});
