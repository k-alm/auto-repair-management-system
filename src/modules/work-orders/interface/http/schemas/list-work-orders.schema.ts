import { z } from "zod";
import { WorkOrderStatus } from "../../../domain/work-order-status";

export const listWorkOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(WorkOrderStatus).optional(),
});
