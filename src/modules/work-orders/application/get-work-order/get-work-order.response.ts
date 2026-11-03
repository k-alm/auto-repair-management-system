import type { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import type { WorkOrderStatus } from "../../domain/work-order-status";

export interface GetWorkOrderResponse {
  id: string;
  status: WorkOrderStatus;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  customer: {
    id: string;
    name: string;
    document: string;
    email: string;
    phone: string;
  };
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
  };
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
