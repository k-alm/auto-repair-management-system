import { z } from "zod";

export const createWorkOrderBodySchema = z.object({
  customerDocument: z.string().min(11).max(18),
  vehicleId: z.uuid(),
  serviceIds: z.array(z.uuid()).min(1).max(30),
  parts: z
    .array(
      z.object({
        partId: z.uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .max(50),
});
