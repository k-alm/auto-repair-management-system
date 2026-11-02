import { createCustomerBodySchema } from "./create-customer.schema";

export const updateCustomerBodySchema = createCustomerBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0);
