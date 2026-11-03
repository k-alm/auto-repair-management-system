import { hashToken } from "@/shared/infrastructure/secure-tokens";
import type { QuoteTokenHasher } from "../../application/decide-quote/decide-quote.usecase";

export class Sha256QuoteTokenHasher implements QuoteTokenHasher {
  hash(token: string) {
    return hashToken(token);
  }
}
