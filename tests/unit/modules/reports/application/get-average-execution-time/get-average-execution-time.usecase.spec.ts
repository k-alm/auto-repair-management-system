import { describe, expect, it } from "vitest";
import { GetAverageExecutionTimeUseCase } from "@/modules/reports/application/get-average-execution-time/get-average-execution-time.usecase";
import type {
  ExecutionPeriod,
  ExecutionTimeRepository,
} from "@/modules/reports/domain/execution-time.repository";

class FakeExecutionTimeRepository implements ExecutionTimeRepository {
  constructor(private readonly periods: ExecutionPeriod[]) {}

  async findCompletedPeriods() {
    return this.periods;
  }
}

describe("GetAverageExecutionTimeUseCase", () => {
  it("calculates an average and excludes invalid periods", async () => {
    const repository = new FakeExecutionTimeRepository([
      { startedAt: new Date("2025-01-01T10:00:00Z"), finishedAt: new Date("2025-01-01T11:00:00Z") },
      { startedAt: new Date("2025-01-02T10:00:00Z"), finishedAt: new Date("2025-01-02T10:30:00Z") },
      { startedAt: null, finishedAt: new Date("2025-01-03T10:00:00Z") },
      { startedAt: new Date("2025-01-04T10:00:00Z"), finishedAt: new Date("2025-01-04T09:00:00Z") },
    ]);

    await expect(new GetAverageExecutionTimeUseCase(repository).execute({})).resolves.toEqual({
      metric: "average_work_order_execution_minutes",
      averageMinutes: 45,
      completedOrders: 2,
      period: { startsAt: "EM_EXECUCAO", endsAt: "FINALIZADA" },
    });
  });

  it("returns no average when there are no valid durations", async () => {
    const repository = new FakeExecutionTimeRepository([]);
    await expect(new GetAverageExecutionTimeUseCase(repository).execute({})).resolves.toMatchObject(
      { averageMinutes: null, completedOrders: 0 },
    );
  });
});
