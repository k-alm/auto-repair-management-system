import { CustomerDocument } from "@/modules/customers/domain/value-objects/customer-document";
import {
  WorkOrderDuplicateItemsError,
  WorkOrderInvalidPartQuantityError,
} from "../../domain/work-order.errors";
import type { WorkOrderRepository } from "../../domain/work-order.repository";
import type { CreateWorkOrderInput } from "./create-work-order.input";
import type { CreateWorkOrderResponse } from "./create-work-order.response";

export interface TrackingTokenGenerator {
  create(): { token: string; hash: string };
}

export class CreateWorkOrderUseCase {
  constructor(
    private readonly workOrders: WorkOrderRepository,
    private readonly tokens: TrackingTokenGenerator,
    private readonly trackingTokenTtlDays: number,
    private readonly publicApiUrl: string,
  ) {}

  async execute(input: CreateWorkOrderInput): Promise<CreateWorkOrderResponse> {
    if (new Set(input.serviceIds).size !== input.serviceIds.length) {
      throw new WorkOrderDuplicateItemsError("Serviços");
    }
    if (new Set(input.parts.map(({ partId }) => partId)).size !== input.parts.length) {
      throw new WorkOrderDuplicateItemsError("Peças");
    }
    if (input.parts.some(({ quantity }) => !Number.isInteger(quantity) || quantity <= 0)) {
      throw new WorkOrderInvalidPartQuantityError();
    }

    const tracking = this.tokens.create();
    const trackingTokenExpiresAt = new Date(Date.now() + this.trackingTokenTtlDays * 86400000);
    const customerDocument = CustomerDocument.create(input.customerDocument).value;

    return this.workOrders.create({
      customerDocument,
      vehicleId: input.vehicleId,
      serviceIds: input.serviceIds,
      parts: input.parts,
      trackingTokenHash: tracking.hash,
      trackingToken: tracking.token,
      trackingTokenExpiresAt,
      publicApiUrl: this.publicApiUrl.replace(/\/$/, ""),
    });
  }
}
