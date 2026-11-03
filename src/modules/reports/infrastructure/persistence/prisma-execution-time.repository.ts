import type { PrismaClient } from "@prisma/client";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";
import type {
  ExecutionPeriod,
  ExecutionTimeRepository,
} from "../../domain/execution-time.repository";

export class PrismaExecutionTimeRepository implements ExecutionTimeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCompletedPeriods(): Promise<ExecutionPeriod[]> {
    return this.prisma.workOrder.findMany({
      where: {
        status: { in: [WorkOrderStatus.FINALIZADA, WorkOrderStatus.ENTREGUE] },
        startedAt: { not: null },
        finishedAt: { not: null },
      },
      select: { startedAt: true, finishedAt: true },
    });
  }
}
