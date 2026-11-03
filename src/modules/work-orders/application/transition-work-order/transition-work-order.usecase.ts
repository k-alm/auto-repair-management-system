import { ConflictError } from "@/shared/domain/errors";
import { WorkOrderNotFoundError } from "../../domain/work-order.errors";
import type { WorkOrderRepository } from "../../domain/work-order.repository";
import { assertWorkOrderTransition } from "../../domain/work-order-rules";
import { WorkOrderStatus } from "../../domain/work-order-status";
import type { TransitionWorkOrderInput } from "./transition-work-order.input";
import type { TransitionWorkOrderResponse } from "./transition-work-order.response";

export class TransitionWorkOrderUseCase {
  constructor(private readonly workOrders: WorkOrderRepository) {}

  async execute(input: TransitionWorkOrderInput): Promise<TransitionWorkOrderResponse> {
    const current = await this.workOrders.findById(input.id);
    if (!current) throw new WorkOrderNotFoundError();
    if (
      current.status === WorkOrderStatus.AGUARDANDO_APROVACAO &&
      input.to === WorkOrderStatus.EM_EXECUCAO
    ) {
      throw new ConflictError("A execução deve ser iniciada pela aprovação do orçamento");
    }
    assertWorkOrderTransition(current.status, input.to);
    return this.workOrders.transition({ ...input, now: new Date() });
  }
}
