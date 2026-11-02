import { createServiceBodySchema } from "./create-service.schema";

export const updateServiceBodySchema = createServiceBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0);
