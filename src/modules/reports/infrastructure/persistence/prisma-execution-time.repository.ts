import type { PrismaClient } from "@prisma/client";
import type {
  ExecutionPeriod,
  ExecutionTimeRepository,
} from "../../domain/execution-time.repository";

export class PrismaExecutionTimeRepository implements ExecutionTimeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCompletedPeriods(): Promise<ExecutionPeriod[]> {
    return this.prisma.workOrder.findMany({
      where: {
        status: { in: ["FINALIZADA", "ENTREGUE"] },
        startedAt: { not: null },
        finishedAt: { not: null },
      },
      select: { startedAt: true, finishedAt: true },
    });
  }
}
