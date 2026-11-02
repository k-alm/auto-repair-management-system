import { afterEach, describe, expect, it } from "vitest";
import { Part } from "@/modules/parts/domain/entities/part";
import { createCatalogApiTestApp } from "../support/create-catalog-api-test-app";

describe("PATCH /api/parts/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("updates a part", async () => {
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
    const response = await app.inject({
      method: "PATCH",
      url: `/api/parts/${part.props.id}`,
      payload: { sku: "F-2" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ sku: "F-2" });
  });
});
