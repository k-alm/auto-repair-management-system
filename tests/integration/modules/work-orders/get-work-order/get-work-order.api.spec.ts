import { afterEach, describe, expect, it } from "vitest";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";
import { createWorkOrderApiTestApp } from "../support/create-work-order-api-test-app";

describe("GET /api/work-orders/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns order details without status history", async () => {
    const { app, repository } = await createWorkOrderApiTestApp();
    close = () => app.close();
    repository.details = {
      id: repository.orderId,
      status: WorkOrderStatus.RECEBIDA,
      createdAt: new Date("2026-01-01T10:00:00Z"),
      startedAt: null,
      finishedAt: null,
      customer: {
        id: "00000000-0000-4000-8000-000000000012",
        name: "Ana",
        document: "52998224725",
        email: "ana@example.com",
        phone: "11999999999",
      },
      vehicle: {
        id: "00000000-0000-4000-8000-000000000010",
        plate: "ABC1234",
        brand: "Marca",
        model: "Modelo",
        year: 2020,
      },
      services: [],
      parts: [],
      quote: null,
    };
    const response = await app.inject({
      method: "GET",
      url: `/api/work-orders/${repository.orderId}`,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).not.toHaveProperty("statusHistory");
  });
});
