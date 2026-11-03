import type { WorkOrderPage } from "../../domain/work-order.repository";

export interface ListWorkOrdersResponse extends WorkOrderPage {
  page: number;
  pageSize: number;
}
