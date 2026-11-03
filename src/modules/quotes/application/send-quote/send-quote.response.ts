import type { QuoteStatus } from "../../domain/quote-status";

export interface SendQuoteResponse {
  id: string;
  status: QuoteStatus.PENDING;
  total: string;
  expiresAt: Date;
}
