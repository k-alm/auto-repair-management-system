import { z } from "zod";

export const vehicleResponseSchema = z.object({
  id: z.uuid(),
  customerId: z.uuid(),
  plate: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number().int(),
});

export const vehicleListResponseSchema = z.object({
  items: z.array(vehicleResponseSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
