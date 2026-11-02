import { z } from "zod";

const price = z.string().regex(/^\d+(\.\d{1,2})?$/, "Informe um valor decimal com até duas casas");

export const createServiceBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  price,
  estimatedMinutes: z.number().int().positive().max(100000),
  isActive: z.boolean().default(true),
});
