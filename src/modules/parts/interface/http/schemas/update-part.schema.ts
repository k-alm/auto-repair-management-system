import { createPartBodySchema } from "./create-part.schema";

export const updatePartBodySchema = createPartBodySchema
  .omit({ stockQuantity: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0);
