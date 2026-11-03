import { afterEach, describe, expect, it } from "vitest";
import { Part } from "@/modules/parts/domain/entities/part";
import { createCatalogApiTestApp } from "../support/create-catalog-api-test-app";

describe("GET /api/parts", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns a paginated list of parts", async () => {
    const { app, repository } = await createCatalogApiTestApp();
    close = () => app.close();
    await repository.createPart(
      Part.create({
        name: "Filtro",
        description: null,
        sku: "F-1",
        price: "20",
        isActive: true,
      }),
    );
    const response = await app.inject({ method: "GET", url: "/api/parts?page=1&pageSize=10" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ total: 1, items: [{ sku: "F-1" }] });
  });
});
