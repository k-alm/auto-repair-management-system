import { z } from "zod";

export const createCustomerBodySchema = z.object({
  name: z.string().trim().min(2).max(160),
  document: z.string().min(11).max(18),
  email: z.email(),
  phone: z.string().trim().min(8).max(30),
});
