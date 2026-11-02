import { z } from "zod";

export const listWorkOrdersResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.uuid(),
      status: z.string(),
      createdAt: z.date(),
      customer: z.object({ id: z.uuid(), name: z.string() }),
      vehicle: z.object({
        id: z.uuid(),
        plate: z.string(),
        brand: z.string(),
        model: z.string(),
      }),
      quote: z.object({ id: z.uuid(), status: z.string(), total: z.string() }).nullable(),
    }),
  ),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
