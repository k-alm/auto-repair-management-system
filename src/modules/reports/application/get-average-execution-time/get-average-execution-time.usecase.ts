import { averageExecutionMinutes } from "../../domain/average-execution-minutes";
import type { ExecutionTimeRepository } from "../../domain/execution-time.repository";
import type { GetAverageExecutionTimeInput } from "./get-average-execution-time.input";
import type { GetAverageExecutionTimeResponse } from "./get-average-execution-time.response";

export class GetAverageExecutionTimeUseCase {
  constructor(private readonly executionTimes: ExecutionTimeRepository) {}

  async execute(_input: GetAverageExecutionTimeInput): Promise<GetAverageExecutionTimeResponse> {
    const periods = await this.executionTimes.findCompletedPeriods();
    const durations = periods.flatMap(({ startedAt, finishedAt }) => {
      if (!startedAt || !finishedAt || finishedAt <= startedAt) return [];
      return [(finishedAt.getTime() - startedAt.getTime()) / 60000];
    });

    return {
      metric: "average_work_order_execution_minutes",
      averageMinutes: averageExecutionMinutes(durations),
      completedOrders: durations.length,
      period: { startsAt: "EM_EXECUCAO", endsAt: "FINALIZADA" },
    };
  }
}
