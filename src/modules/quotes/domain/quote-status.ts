import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";
import { QuoteDecisionConflictError } from "./quote.errors";

export enum QuoteStatus {
  PREPARED = "PREPARED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export type QuoteDecision = QuoteStatus.APPROVED | QuoteStatus.REJECTED;

export function decideQuoteStatus(status: QuoteStatus, decision: QuoteDecision): QuoteStatus {
  if (status !== QuoteStatus.PENDING) {
    throw new QuoteDecisionConflictError();
  }

  return decision;
}

export function expireQuoteStatus(status: QuoteStatus): QuoteStatus {
  if (status !== QuoteStatus.PENDING) {
    throw new QuoteDecisionConflictError();
  }

  return QuoteStatus.EXPIRED;
}

export function workOrderStatusForQuoteDecision(
  decision: QuoteDecision,
): WorkOrderStatus.EM_EXECUCAO | WorkOrderStatus.CANCELADA {
  return decision === QuoteStatus.APPROVED
    ? WorkOrderStatus.EM_EXECUCAO
    : WorkOrderStatus.CANCELADA;
}
