import { createPartBodySchema } from "./create-part.schema";

export const updatePartBodySchema = createPartBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0);
