import { z } from "zod";
import { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import { WorkOrderStatus } from "../../../domain/work-order-status";

export const listWorkOrdersResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.uuid(),
      status: z.enum(WorkOrderStatus),
      createdAt: z.date(),
      customer: z.object({ id: z.uuid(), name: z.string() }),
      vehicle: z.object({
        id: z.uuid(),
        plate: z.string(),
        brand: z.string(),
        model: z.string(),
      }),
      quote: z.object({ id: z.uuid(), status: z.enum(QuoteStatus), total: z.string() }).nullable(),
    }),
  ),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
