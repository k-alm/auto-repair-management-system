import { afterEach, describe, expect, it } from "vitest";
import { createCatalogApiTestApp } from "../support/create-catalog-api-test-app";

describe("POST /api/parts", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("creates a part without inventory data", async () => {
    const { app, repository } = await createCatalogApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/parts",
      payload: { name: "Filtro", sku: "F-1", price: "20", isActive: true },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ name: "Filtro", sku: "F-1", price: "20.00" });
    expect(response.json()).not.toHaveProperty("stockQuantity");
    expect(repository.parts.size).toBe(1);
  });
});
