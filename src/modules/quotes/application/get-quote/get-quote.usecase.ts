import { QuoteNotFoundError } from "../../domain/quote.errors";
import type { QuoteRepository } from "../../domain/quote.repository";
import type { GetQuoteInput } from "./get-quote.input";
import type { GetQuoteResponse } from "./get-quote.response";

export class GetQuoteUseCase {
  constructor(private readonly quotes: QuoteRepository) {}

  async execute(input: GetQuoteInput): Promise<GetQuoteResponse> {
    const quote = await this.quotes.findDetails(input.id);
    if (!quote) throw new QuoteNotFoundError();
    return quote;
  }
}
