import { z } from "zod";

export const quoteResponseSchema = z.object({
  id: z.uuid(),
  workOrderId: z.uuid(),
  status: z.string(),
  total: z.string(),
  createdAt: z.date(),
  expiresAt: z.date().nullable(),
  respondedAt: z.date().nullable(),
  workOrder: z.object({
    customer: z.object({ name: z.string(), document: z.string() }),
    services: z.array(
      z.object({
        service: z.object({ name: z.string() }),
        unitPrice: z.string(),
      }),
    ),
    parts: z.array(
      z.object({
        part: z.object({ name: z.string(), sku: z.string() }),
        quantity: z.number().int(),
        unitPrice: z.string(),
      }),
    ),
  }),
});
