import { FakeQuoteRepository } from "@tests/support/fake-quote.repository";
import { describe, expect, it } from "vitest";
import { SendQuoteUseCase } from "@/modules/quotes/application/send-quote/send-quote.usecase";
import { QuoteStatus } from "@/modules/quotes/domain/quote-status";

describe("SendQuoteUseCase", () => {
  it("creates an approval credential and asks the repository to send it", async () => {
    const repository = new FakeQuoteRepository();
    const result = await new SendQuoteUseCase(
      repository,
      { create: () => ({ token: "approval-token", tokenHash: "sha", authorizationId: "auth" }) },
      24,
      "https://api.example.com/",
    ).execute({ workOrderId: "work-order-id" });

    expect(result).toMatchObject({
      id: "00000000-0000-4000-8000-000000000004",
      status: QuoteStatus.PENDING,
      total: "25.00",
    });
    expect(repository.sentInput).toMatchObject({
      id: "work-order-id",
      token: "approval-token",
      tokenHash: "sha",
      authorizationId: "auth",
      publicApiUrl: "https://api.example.com",
    });
  });
});
