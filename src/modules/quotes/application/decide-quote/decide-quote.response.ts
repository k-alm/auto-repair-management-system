import type { WorkOrderStatus } from "../../../work-orders/domain/work-order-status";
import type { QuoteDecision } from "../../domain/quote-status";

export interface DecideQuoteResponse {
  expired: false;
  authorizationId: string;
  decision: QuoteDecision;
  decidedAt: Date;
  workOrderStatus: WorkOrderStatus.EM_EXECUCAO | WorkOrderStatus.CANCELADA;
}
