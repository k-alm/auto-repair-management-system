export interface QuoteDetails {
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

export type QuoteDecisionResult =
  | { expired: true }
  | {
      expired: false;
      authorizationId: string;
      decision: "APPROVED" | "REJECTED";
      decidedAt: Date;
      workOrderStatus: string;
    };

export interface SendQuoteInput {
  id: string;
  token: string;
  tokenHash: string;
  authorizationId: string;
  expiresAt: Date;
  publicApiUrl: string;
}

export interface DecideQuoteInput {
  id: string;
  tokenHash: string;
  decision: "APPROVED" | "REJECTED";
  now: Date;
}

export interface QuoteRepository {
  findDetails(id: string): Promise<QuoteDetails | null>;
  send(input: SendQuoteInput): Promise<{
    id: string;
    status: string;
    total: string;
    expiresAt: Date;
  }>;
  decide(input: DecideQuoteInput): Promise<QuoteDecisionResult>;
}
