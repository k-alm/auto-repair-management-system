import { FakeWorkOrderRepository } from "@tests/support/fake-work-order.repository";
import { describe, expect, it } from "vitest";
import { GetWorkOrderUseCase } from "@/modules/work-orders/application/get-work-order/get-work-order.usecase";
import { WorkOrderNotFoundError } from "@/modules/work-orders/domain/work-order.errors";

describe("GetWorkOrderUseCase", () => {
  it("rejects unknown order ids", async () => {
    await expect(
      new GetWorkOrderUseCase(new FakeWorkOrderRepository()).execute({ id: "missing" }),
    ).rejects.toBeInstanceOf(WorkOrderNotFoundError);
  });
});
