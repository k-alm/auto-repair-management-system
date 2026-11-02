export interface GetAverageExecutionTimeResponse {
  metric: "average_work_order_execution_minutes";
  averageMinutes: number | null;
  completedOrders: number;
  period: {
    startsAt: "EM_EXECUCAO";
    endsAt: "FINALIZADA";
  };
}
