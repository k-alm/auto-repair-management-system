import { FakeWorkOrderRepository } from "@tests/support/fake-work-order.repository";
import { describe, expect, it } from "vitest";
import { ListWorkOrdersUseCase } from "@/modules/work-orders/application/list-work-orders/list-work-orders.usecase";

describe("ListWorkOrdersUseCase", () => {
  it("applies pagination and returns total results", async () => {
    await expect(
      new ListWorkOrdersUseCase(new FakeWorkOrderRepository()).execute({
        page: 2,
        pageSize: 10,
        status: "RECEBIDA",
      }),
    ).resolves.toEqual({ items: [], total: 0, page: 2, pageSize: 10 });
  });
});
