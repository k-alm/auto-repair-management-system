import { afterEach, describe, expect, it } from "vitest";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";
import { createTrackingApiTestApp } from "../support/create-tracking-api-test-app";

describe("GET /api/public/work-orders/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns public tracking information with a valid token", async () => {
    const { app, repository } = await createTrackingApiTestApp();
    close = () => app.close();
    repository.trackedOrder = {
      id: "00000000-0000-4000-8000-000000000030",
      status: WorkOrderStatus.EM_EXECUCAO,
      openedAt: new Date("2026-01-01T10:00:00Z"),
      vehicle: { plate: "ABC1234", brand: "Marca", model: "Modelo", year: 2020 },
      services: ["Revisão"],
      startedAt: new Date("2026-01-01T11:00:00Z"),
      finishedAt: null,
    };
    const response = await app.inject({
      method: "GET",
      url: `/api/public/work-orders/${repository.trackedOrder.id}`,
      headers: { "x-tracking-token": "valid-tracking-token" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: WorkOrderStatus.EM_EXECUCAO,
      services: ["Revisão"],
    });
    expect(response.json()).not.toHaveProperty("statusHistory");
  });
});
