import { z } from "zod";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";

export const averageExecutionTimeResponseSchema = z.object({
  metric: z.literal("average_work_order_execution_minutes"),
  averageMinutes: z.number().nullable(),
  completedOrders: z.number().int(),
  period: z.object({
    startsAt: z.literal(WorkOrderStatus.EM_EXECUCAO),
    endsAt: z.literal(WorkOrderStatus.FINALIZADA),
  }),
});
