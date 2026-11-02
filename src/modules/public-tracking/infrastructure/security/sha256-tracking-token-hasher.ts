import { hashToken } from "@/shared/infrastructure/secure-tokens";
import type { TrackingTokenHasher } from "../../application/get-public-tracking/get-public-tracking.usecase";

export class Sha256TrackingTokenHasher implements TrackingTokenHasher {
  hash(token: string) {
    return hashToken(token);
  }
}
