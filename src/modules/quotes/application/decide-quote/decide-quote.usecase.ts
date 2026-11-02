import { QuoteDecisionConflictError } from "../../domain/quote.errors";
import type { QuoteRepository } from "../../domain/quote.repository";
import type { DecideQuoteInput } from "./decide-quote.input";
import type { DecideQuoteResponse } from "./decide-quote.response";

export interface QuoteTokenHasher {
  hash(token: string): string;
}

export class DecideQuoteUseCase {
  constructor(
    private readonly quotes: QuoteRepository,
    private readonly tokens: QuoteTokenHasher,
  ) {}

  async execute(input: DecideQuoteInput): Promise<DecideQuoteResponse> {
    const result = await this.quotes.decide({
      id: input.id,
      tokenHash: this.tokens.hash(input.token),
      decision: input.decision,
      now: new Date(),
    });
    if (result.expired) throw new QuoteDecisionConflictError("O orçamento expirou");
    return {
      expired: false,
      authorizationId: result.authorizationId,
      decision: result.decision,
      decidedAt: result.decidedAt,
      workOrderStatus: result.workOrderStatus,
    };
  }
}
