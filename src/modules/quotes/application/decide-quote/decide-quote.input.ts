export interface DecideQuoteInput {
  id: string;
  token: string;
  decision: "APPROVED" | "REJECTED";
}
