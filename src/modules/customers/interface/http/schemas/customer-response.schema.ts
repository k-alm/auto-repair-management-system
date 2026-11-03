import { z } from "zod";

export const customerResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  document: z.string(),
  email: z.email(),
  phone: z.string(),
});

export const customerDetailResponseSchema = customerResponseSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createdCustomerResponseSchema = customerResponseSchema.extend({
  createdAt: z.date(),
});

export const customerListResponseSchema = z.object({
  items: z.array(customerResponseSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
