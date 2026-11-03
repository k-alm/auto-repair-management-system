import type { WorkOrderStatus } from "../../work-orders/domain/work-order-status";
import type { QuoteDecision, QuoteStatus } from "./quote-status";

export interface QuoteDetails {
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

export type QuoteDecisionResult =
  | { expired: true }
  | {
      expired: false;
      authorizationId: string;
      decision: QuoteDecision;
      decidedAt: Date;
      workOrderStatus: WorkOrderStatus.EM_EXECUCAO | WorkOrderStatus.CANCELADA;
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
  decision: QuoteDecision;
  now: Date;
}

export interface QuoteRepository {
  findDetails(id: string): Promise<QuoteDetails | null>;
  send(input: SendQuoteInput): Promise<{
    id: string;
    status: QuoteStatus;
    total: string;
    expiresAt: Date;
  }>;
  decide(input: DecideQuoteInput): Promise<QuoteDecisionResult>;
}
