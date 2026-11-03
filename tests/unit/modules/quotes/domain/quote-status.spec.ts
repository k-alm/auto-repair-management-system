import { describe, expect, it } from "vitest";
import { QuoteDecisionConflictError } from "@/modules/quotes/domain/quote.errors";
import {
  decideQuoteStatus,
  expireQuoteStatus,
  QuoteStatus,
  workOrderStatusForQuoteDecision,
} from "@/modules/quotes/domain/quote-status";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";

describe("QuoteStatus", () => {
  it("preserves the textual values stored in the database", () => {
    expect(Object.values(QuoteStatus)).toEqual([
      "PREPARED",
      "PENDING",
      "APPROVED",
      "REJECTED",
      "EXPIRED",
    ]);
  });

  it.each([
    [QuoteStatus.APPROVED, WorkOrderStatus.EM_EXECUCAO],
    [QuoteStatus.REJECTED, WorkOrderStatus.CANCELADA],
  ] as const)("applies a valid %s decision", (decision, expectedStatus) => {
    expect(decideQuoteStatus(QuoteStatus.PENDING, decision)).toBe(decision);
    expect(workOrderStatusForQuoteDecision(decision)).toBe(expectedStatus);
  });

  it("expires a pending quote", () => {
    expect(expireQuoteStatus(QuoteStatus.PENDING)).toBe(QuoteStatus.EXPIRED);
  });

  it.each([
    QuoteStatus.PREPARED,
    QuoteStatus.APPROVED,
    QuoteStatus.REJECTED,
    QuoteStatus.EXPIRED,
  ])("rejects a decision from %s", (status) => {
    expect(() => decideQuoteStatus(status, QuoteStatus.APPROVED)).toThrow(
      QuoteDecisionConflictError,
    );
  });

  it("rejects expiring a quote that is not pending", () => {
    expect(() => expireQuoteStatus(QuoteStatus.APPROVED)).toThrow(QuoteDecisionConflictError);
  });
});
