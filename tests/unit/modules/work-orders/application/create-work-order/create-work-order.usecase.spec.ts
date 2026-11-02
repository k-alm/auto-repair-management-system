import { FakeWorkOrderRepository } from "@tests/support/fake-work-order.repository";
import { describe, expect, it } from "vitest";
import { CreateWorkOrderUseCase } from "@/modules/work-orders/application/create-work-order/create-work-order.usecase";
import {
  WorkOrderDuplicateItemsError,
  WorkOrderInvalidPartQuantityError,
} from "@/modules/work-orders/domain/work-order.errors";

const sample = {
  customerDocument: "529.982.247-25",
  vehicleId: "vehicle-id",
  serviceIds: ["service-id"],
  parts: [{ partId: "part-id", quantity: 2 }],
};

describe("CreateWorkOrderUseCase", () => {
  it("normalizes the document and creates an expiring tracking link", async () => {
    const repository = new FakeWorkOrderRepository();
    const result = await new CreateWorkOrderUseCase(
      repository,
      { create: () => ({ token: "secret-token", hash: "hashed-token" }) },
      7,
      "https://api.example.com/",
    ).execute(sample);

    expect(result.id).toBe(repository.orderId);
    expect(repository.createdInput).toMatchObject({
      customerDocument: "52998224725",
      trackingTokenHash: "hashed-token",
      trackingToken: "secret-token",
      publicApiUrl: "https://api.example.com",
    });
    expect(repository.createdInput?.trackingTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("rejects duplicated service identifiers", async () => {
    await expect(
      new CreateWorkOrderUseCase(
        new FakeWorkOrderRepository(),
        { create: () => ({ token: "token", hash: "hash" }) },
        7,
        "https://api.example.com",
      ).execute({ ...sample, serviceIds: ["service-id", "service-id"] }),
    ).rejects.toBeInstanceOf(WorkOrderDuplicateItemsError);
  });

  it("rejects non-positive part quantities", async () => {
    await expect(
      new CreateWorkOrderUseCase(
        new FakeWorkOrderRepository(),
        { create: () => ({ token: "token", hash: "hash" }) },
        7,
        "https://api.example.com",
      ).execute({
        ...sample,
        parts: [{ partId: "part-id", quantity: 0 }],
      }),
    ).rejects.toBeInstanceOf(WorkOrderInvalidPartQuantityError);
  });
});
