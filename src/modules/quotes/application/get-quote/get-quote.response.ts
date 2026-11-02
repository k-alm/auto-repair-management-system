export interface GetQuoteResponse {
  id: string;
  workOrderId: string;
  status: string;
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
