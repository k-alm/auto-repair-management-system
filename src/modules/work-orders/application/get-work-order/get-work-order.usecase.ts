import { WorkOrderNotFoundError } from "../../domain/work-order.errors";
import type { WorkOrderRepository } from "../../domain/work-order.repository";
import type { GetWorkOrderInput } from "./get-work-order.input";
import type { GetWorkOrderResponse } from "./get-work-order.response";

export class GetWorkOrderUseCase {
  constructor(private readonly workOrders: WorkOrderRepository) {}

  async execute(input: GetWorkOrderInput): Promise<GetWorkOrderResponse> {
    const order = await this.workOrders.findById(input.id);
    if (!order) throw new WorkOrderNotFoundError();
    return order;
  }
}
