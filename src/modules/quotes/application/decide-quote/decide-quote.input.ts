import type { QuoteDecision } from "../../domain/quote-status";

export interface DecideQuoteInput {
  id: string;
  token: string;
  decision: QuoteDecision;
}
