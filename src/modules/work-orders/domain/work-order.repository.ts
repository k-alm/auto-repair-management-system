import type { workOrderStatuses } from "./work-order-rules";

export type WorkOrderStatus = (typeof workOrderStatuses)[number];

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
  status: string;
  createdAt: Date;
  quote: { id: string; status: string; total: string };
}

export interface WorkOrderListItem {
  id: string;
  status: string;
  createdAt: Date;
  customer: { id: string; name: string };
  vehicle: { id: string; plate: string; brand: string; model: string };
  quote: { id: string; status: string; total: string } | null;
}

export interface WorkOrderDetails {
  id: string;
  status: string;
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
    status: string;
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
    from: string;
    status: string;
  }>;
}
