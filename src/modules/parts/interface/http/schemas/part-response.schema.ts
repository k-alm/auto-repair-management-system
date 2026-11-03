import { z } from "zod";

export const partResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  sku: z.string(),
  price: z.string(),
  isActive: z.boolean(),
  stockQuantity: z.number().int().nonnegative(),
});
