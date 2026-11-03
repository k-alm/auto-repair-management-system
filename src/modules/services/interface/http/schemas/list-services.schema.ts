import { z } from "zod";
import { serviceResponseSchema } from "./service-response.schema";

export const listServicesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const listServicesResponseSchema = z.object({
  items: z.array(serviceResponseSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
