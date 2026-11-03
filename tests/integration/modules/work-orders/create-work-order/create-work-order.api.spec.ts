import { afterEach, describe, expect, it } from "vitest";
import { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";
import { createWorkOrderApiTestApp } from "../support/create-work-order-api-test-app";

describe("POST /api/work-orders", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("creates an order and prepared quote", async () => {
    const { app, repository } = await createWorkOrderApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/work-orders",
      payload: {
        customerDocument: "529.982.247-25",
        vehicleId: "00000000-0000-4000-8000-000000000010",
        serviceIds: ["00000000-0000-4000-8000-000000000011"],
        parts: [],
      },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      id: repository.orderId,
      status: WorkOrderStatus.RECEBIDA,
      quote: { status: QuoteStatus.PREPARED, total: "25.00" },
    });
    expect(repository.createdInput?.customerDocument).toBe("52998224725");
  });
});
