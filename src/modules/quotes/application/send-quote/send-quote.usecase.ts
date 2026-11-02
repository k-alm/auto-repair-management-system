import type { QuoteRepository } from "../../domain/quote.repository";
import type { SendQuoteInput } from "./send-quote.input";
import type { SendQuoteResponse } from "./send-quote.response";

export interface ApprovalCredentialGenerator {
  create(): { token: string; tokenHash: string; authorizationId: string };
}

export class SendQuoteUseCase {
  constructor(
    private readonly quotes: QuoteRepository,
    private readonly credentials: ApprovalCredentialGenerator,
    private readonly ttlHours: number,
    private readonly publicApiUrl: string,
  ) {}

  async execute(input: SendQuoteInput): Promise<SendQuoteResponse> {
    const credential = this.credentials.create();
    const expiresAt = new Date(Date.now() + this.ttlHours * 3600000);
    const sent = await this.quotes.send({
      id: input.workOrderId,
      ...credential,
      expiresAt,
      publicApiUrl: this.publicApiUrl.replace(/\/$/, ""),
    });
    return { ...sent, status: "PENDING" };
  }
}
