import { z } from "zod";

const price = z.string().regex(/^\d+(\.\d{1,2})?$/, "Informe um valor decimal com até duas casas");

export const createPartBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  sku: z.string().trim().min(1).max(80),
  price,
  isActive: z.boolean().default(true),
});
