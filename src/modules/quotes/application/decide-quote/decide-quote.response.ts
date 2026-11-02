export interface DecideQuoteResponse {
  expired: false;
  authorizationId: string;
  decision: "APPROVED" | "REJECTED";
  decidedAt: Date;
  workOrderStatus: string;
}
