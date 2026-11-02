import { afterEach, describe, expect, it } from "vitest";
import { createCatalogApiTestApp } from "../support/create-catalog-api-test-app";

describe("POST /api/services", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("creates a service through the HTTP interface", async () => {
    const { app, repository } = await createCatalogApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/services",
      payload: { name: "Revisão", price: "100", estimatedMinutes: 45, isActive: true },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ name: "Revisão", price: "100.00" });
    expect(repository.services.size).toBe(1);
  });
});
