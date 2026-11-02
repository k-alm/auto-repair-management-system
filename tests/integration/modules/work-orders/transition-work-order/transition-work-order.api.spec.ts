import { afterEach, describe, expect, it } from "vitest";
import { createWorkOrderApiTestApp } from "../support/create-work-order-api-test-app";

describe("POST /api/work-orders/:id/transitions", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("transitions an existing order", async () => {
    const { app, repository } = await createWorkOrderApiTestApp();
    close = () => app.close();
    repository.details = {
      id: repository.orderId,
      status: "RECEBIDA",
      createdAt: new Date(),
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
      method: "POST",
      url: `/api/work-orders/${repository.orderId}/transitions`,
      payload: { to: "EM_DIAGNOSTICO" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "EM_DIAGNOSTICO" });
  });
});
