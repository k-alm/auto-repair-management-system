import type { WorkOrderStatus } from "../../domain/work-order.repository";

export interface ListWorkOrdersInput {
  page: number;
  pageSize: number;
  status?: WorkOrderStatus;
}
