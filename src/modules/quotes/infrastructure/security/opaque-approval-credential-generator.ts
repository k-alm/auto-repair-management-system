import { createOpaqueToken, hashToken } from "@/shared/infrastructure/secure-tokens";
import type { ApprovalCredentialGenerator } from "../../application/send-quote/send-quote.usecase";

export class OpaqueApprovalCredentialGenerator implements ApprovalCredentialGenerator {
  create() {
    const credential = createOpaqueToken();
    return {
      token: credential.token,
      tokenHash: hashToken(credential.token),
      authorizationId: credential.authorizationId,
    };
  }
}
