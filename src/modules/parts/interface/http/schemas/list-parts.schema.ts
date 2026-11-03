import { z } from "zod";
import { partResponseSchema } from "./part-response.schema";

export const listPartsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const listPartsResponseSchema = z.object({
  items: z.array(partResponseSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
