import { FakeQuoteRepository } from "@tests/support/fake-quote.repository";
import { describe, expect, it } from "vitest";
import { DecideQuoteUseCase } from "@/modules/quotes/application/decide-quote/decide-quote.usecase";
import { QuoteDecisionConflictError } from "@/modules/quotes/domain/quote.errors";
import { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";

describe("DecideQuoteUseCase", () => {
  it("hashes the supplied token and returns the decision", async () => {
    const repository = new FakeQuoteRepository();
    const result = await new DecideQuoteUseCase(repository, {
      hash: (token) => `hashed:${token}`,
    }).execute({ id: "quote-id", token: "secret", decision: QuoteStatus.APPROVED });

    expect(repository.decideInput).toMatchObject({ id: "quote-id", tokenHash: "hashed:secret" });
    expect(result).toMatchObject({
      expired: false,
      authorizationId: "00000000-0000-4000-8000-000000000003",
      decision: QuoteStatus.APPROVED,
      workOrderStatus: WorkOrderStatus.EM_EXECUCAO,
    });
  });

  it("rejects expired quotes", async () => {
    const repository = new FakeQuoteRepository();
    repository.decisionResult = { expired: true };
    await expect(
      new DecideQuoteUseCase(repository, { hash: (token) => token }).execute({
        id: "quote-id",
        token: "secret",
        decision: QuoteStatus.REJECTED,
      }),
    ).rejects.toBeInstanceOf(QuoteDecisionConflictError);
  });
});
