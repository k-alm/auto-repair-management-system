import { FakeQuoteRepository } from "@tests/support/fake-quote.repository";
import { describe, expect, it } from "vitest";
import { GetQuoteUseCase } from "@/modules/quotes/application/get-quote/get-quote.usecase";
import { QuoteNotFoundError } from "@/modules/quotes/domain/quote.errors";

describe("GetQuoteUseCase", () => {
  it("rejects missing quotes", async () => {
    await expect(
      new GetQuoteUseCase(new FakeQuoteRepository()).execute({ id: "missing" }),
    ).rejects.toBeInstanceOf(QuoteNotFoundError);
  });
});
