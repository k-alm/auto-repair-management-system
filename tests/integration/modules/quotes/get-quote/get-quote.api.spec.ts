import { afterEach, describe, expect, it } from "vitest";
import { createQuoteApiTestApp } from "../support/create-quote-api-test-app";

describe("GET /api/quotes/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns quote details to an authenticated caller", async () => {
    const { app, repository } = await createQuoteApiTestApp();
    close = () => app.close();
    repository.details = {
      id: "00000000-0000-4000-8000-000000000020",
      workOrderId: "00000000-0000-4000-8000-000000000021",
      status: "PREPARED",
      total: "25.00",
      createdAt: new Date(),
      expiresAt: null,
      respondedAt: null,
      workOrder: {
        customer: { name: "Ana", document: "52998224725" },
        services: [],
        parts: [],
      },
    };
    const response = await app.inject({
      method: "GET",
      url: `/api/quotes/${repository.details.id}`,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "PREPARED", total: "25.00" });
  });
});
