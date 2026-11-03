import type { QuoteStatus } from "../../domain/quote-status";

export interface GetQuoteResponse {
  id: string;
  workOrderId: string;
  status: QuoteStatus;
  total: string;
  createdAt: Date;
  expiresAt: Date | null;
  respondedAt: Date | null;
  workOrder: {
    customer: { name: string; document: string };
    services: { service: { name: string }; unitPrice: string }[];
    parts: {
      part: { name: string; sku: string };
      quantity: number;
      unitPrice: string;
    }[];
  };
}
