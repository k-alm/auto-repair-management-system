export interface SendQuoteResponse {
  id: string;
  status: "PENDING";
  total: string;
  expiresAt: Date;
}
