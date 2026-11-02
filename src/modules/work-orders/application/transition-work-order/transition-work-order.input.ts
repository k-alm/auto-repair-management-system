import type { WorkOrderStatus } from "../../domain/work-order.repository";

export interface TransitionWorkOrderInput {
  id: string;
  to: WorkOrderStatus;
}
