import type { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";

export interface GetAverageExecutionTimeResponse {
  metric: "average_work_order_execution_minutes";
  averageMinutes: number | null;
  completedOrders: number;
  period: {
    startsAt: WorkOrderStatus.EM_EXECUCAO;
    endsAt: WorkOrderStatus.FINALIZADA;
  };
}
