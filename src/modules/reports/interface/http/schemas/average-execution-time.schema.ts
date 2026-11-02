import { z } from "zod";

export const averageExecutionTimeResponseSchema = z.object({
  metric: z.literal("average_work_order_execution_minutes"),
  averageMinutes: z.number().nullable(),
  completedOrders: z.number().int(),
  period: z.object({
    startsAt: z.literal("EM_EXECUCAO"),
    endsAt: z.literal("FINALIZADA"),
  }),
});
