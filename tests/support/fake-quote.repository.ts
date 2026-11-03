import type {
  DecideQuoteInput,
  QuoteDecisionResult,
  QuoteDetails,
  QuoteRepository,
  SendQuoteInput,
} from "@/modules/quotes/domain/quote.repository";
import { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";

export class FakeQuoteRepository implements QuoteRepository {
  details: QuoteDetails | null = null;
  decisionResult: QuoteDecisionResult = {
    expired: false,
    authorizationId: "00000000-0000-4000-8000-000000000003",
    decision: QuoteStatus.APPROVED,
    decidedAt: new Date("2026-01-01T10:00:00Z"),
    workOrderStatus: WorkOrderStatus.EM_EXECUCAO,
  };
  sentInput: SendQuoteInput | null = null;
  decideInput: DecideQuoteInput | null = null;

  async findDetails() {
    return this.details;
  }

  async send(input: SendQuoteInput) {
    this.sentInput = input;
    return {
      id: "00000000-0000-4000-8000-000000000004",
      status: QuoteStatus.PENDING,
      total: "25.00",
      expiresAt: input.expiresAt,
    };
  }

  async decide(input: DecideQuoteInput) {
    this.decideInput = input;
    return this.decisionResult;
  }
}
