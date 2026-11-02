import type { WorkOrderRepository } from "../../domain/work-order.repository";
import type { ListWorkOrdersInput } from "./list-work-orders.input";
import type { ListWorkOrdersResponse } from "./list-work-orders.response";

export class ListWorkOrdersUseCase {
  constructor(private readonly workOrders: WorkOrderRepository) {}

  async execute(input: ListWorkOrdersInput): Promise<ListWorkOrdersResponse> {
    const page = await this.workOrders.list({
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      status: input.status,
    });
    return { ...page, page: input.page, pageSize: input.pageSize };
  }
}
