import { z } from "zod";

export const createVehicleBodySchema = z.object({
  customerId: z.uuid(),
  plate: z.string().min(7).max(8),
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(100),
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
});
