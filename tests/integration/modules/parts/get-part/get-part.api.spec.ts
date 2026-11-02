import { afterEach, describe, expect, it } from "vitest";
import { Part } from "@/modules/parts/domain/entities/part";
import { createCatalogApiTestApp } from "../support/create-catalog-api-test-app";

describe("GET /api/parts/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns a part by id", async () => {
    const { app, repository } = await createCatalogApiTestApp();
    close = () => app.close();
    const part = Part.create({
      name: "Filtro",
      description: null,
      sku: "F-1",
      price: "20",
      isActive: true,
    });
    await repository.createPart(part);
    const response = await app.inject({ method: "GET", url: `/api/parts/${part.props.id}` });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id: part.props.id, sku: "F-1" });
  });
});
