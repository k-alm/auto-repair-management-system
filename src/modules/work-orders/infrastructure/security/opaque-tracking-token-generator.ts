import { createOpaqueToken, hashToken } from "@/shared/infrastructure/secure-tokens";
import type { TrackingTokenGenerator } from "../../application/create-work-order/create-work-order.usecase";

export class OpaqueTrackingTokenGenerator implements TrackingTokenGenerator {
  create() {
    const token = createOpaqueToken().token;
    return { token, hash: hashToken(token) };
  }
}
