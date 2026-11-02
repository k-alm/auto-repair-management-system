import { z } from "zod";
import { workOrderStatuses } from "../../../domain/work-order-rules";

export const listWorkOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(workOrderStatuses).optional(),
});
