import { z } from "zod";
import { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import { WorkOrderStatus } from "../../../domain/work-order-status";

export const getWorkOrderResponseSchema = z.object({
  id: z.uuid(),
  status: z.enum(WorkOrderStatus),
  createdAt: z.date(),
  startedAt: z.date().nullable(),
  finishedAt: z.date().nullable(),
  customer: z.object({
    id: z.uuid(),
    name: z.string(),
    document: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
  vehicle: z.object({
    id: z.uuid(),
    plate: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.number().int(),
  }),
  services: z.array(
    z.object({
      service: z.object({ id: z.uuid(), name: z.string() }),
      unitPrice: z.string(),
    }),
  ),
  parts: z.array(
    z.object({
      part: z.object({ id: z.uuid(), name: z.string(), sku: z.string() }),
      quantity: z.number().int(),
      unitPrice: z.string(),
    }),
  ),
  quote: z
    .object({
      id: z.uuid(),
      status: z.enum(QuoteStatus),
      total: z.string(),
      expiresAt: z.date().nullable(),
      respondedAt: z.date().nullable(),
    })
    .nullable(),
});
