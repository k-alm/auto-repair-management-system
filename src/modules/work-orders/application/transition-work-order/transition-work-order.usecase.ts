import { WorkOrderNotFoundError } from "../../domain/work-order.errors";
import type { WorkOrderRepository } from "../../domain/work-order.repository";
import { assertWorkOrderTransition } from "../../domain/work-order-rules";
import type { TransitionWorkOrderInput } from "./transition-work-order.input";
import type { TransitionWorkOrderResponse } from "./transition-work-order.response";

export class TransitionWorkOrderUseCase {
  constructor(private readonly workOrders: WorkOrderRepository) {}

  async execute(input: TransitionWorkOrderInput): Promise<TransitionWorkOrderResponse> {
    const current = await this.workOrders.findById(input.id);
    if (!current) throw new WorkOrderNotFoundError();
    assertWorkOrderTransition(current.status, input.to);
    return this.workOrders.transition({ ...input, now: new Date() });
  }
}
