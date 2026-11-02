import { UnauthorizedError } from "@/shared/domain/errors";
import type { TrackingRepository } from "../../domain/tracking.repository";
import type { GetPublicTrackingInput } from "./get-public-tracking.input";
import type { GetPublicTrackingResponse } from "./get-public-tracking.response";

export interface TrackingTokenHasher {
  hash(token: string): string;
}

export class GetPublicTrackingUseCase {
  constructor(
    private readonly tracking: TrackingRepository,
    private readonly tokens: TrackingTokenHasher,
  ) {}

  async execute(input: GetPublicTrackingInput): Promise<GetPublicTrackingResponse> {
    const order = await this.tracking.findAuthorized({
      id: input.id,
      tokenHash: this.tokens.hash(input.token),
      now: new Date(),
    });
    if (!order) throw new UnauthorizedError("Autorização de acompanhamento inválida ou expirada");
    return order;
  }
}
