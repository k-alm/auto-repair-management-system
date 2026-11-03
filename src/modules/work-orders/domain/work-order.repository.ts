import type { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import type { WorkOrderStatus } from "./work-order-status";

export { WorkOrderStatus } from "./work-order-status";

export interface CreateWorkOrderData {
  customerDocument: string;
  vehicleId: string;
  serviceIds: string[];
  parts: { partId: string; quantity: number }[];
  trackingTokenHash: string;
  trackingToken: string;
  trackingTokenExpiresAt: Date;
  publicApiUrl: string;
}

export interface WorkOrderCreated {
  id: string;
  status: WorkOrderStatus;
  createdAt: Date;
  quote: { id: string; status: QuoteStatus; total: string };
}

export interface WorkOrderListItem {
  id: string;
  status: WorkOrderStatus;
  createdAt: Date;
  customer: { id: string; name: string };
  vehicle: { id: string; plate: string; brand: string; model: string };
  quote: { id: string; status: QuoteStatus; total: string } | null;
}

export interface WorkOrderDetails {
  id: string;
  status: WorkOrderStatus;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  customer: { id: string; name: string; document: string; email: string; phone: string };
  vehicle: { id: string; plate: string; brand: string; model: string; year: number };
  services: { service: { id: string; name: string }; unitPrice: string }[];
  parts: {
    part: { id: string; name: string; sku: string };
    quantity: number;
    unitPrice: string;
  }[];
  quote: {
    id: string;
    status: QuoteStatus;
    total: string;
    expiresAt: Date | null;
    respondedAt: Date | null;
  } | null;
}

export interface WorkOrderPage {
  items: WorkOrderListItem[];
  total: number;
}

export interface WorkOrderRepository {
  create(input: CreateWorkOrderData): Promise<WorkOrderCreated>;
  list(input: { skip: number; take: number; status?: WorkOrderStatus }): Promise<WorkOrderPage>;
  findById(id: string): Promise<WorkOrderDetails | null>;
  transition(input: { id: string; to: WorkOrderStatus; now: Date }): Promise<{
    id: string;
    from: WorkOrderStatus;
    status: WorkOrderStatus;
  }>;
}
