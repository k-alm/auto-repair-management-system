import { afterEach, describe, expect, it } from "vitest";
import { Service } from "@/modules/services/domain/entities/service";
import { createCatalogApiTestApp } from "../support/create-catalog-api-test-app";

describe("PATCH /api/services/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("updates a service", async () => {
    const { app, repository } = await createCatalogApiTestApp();
    close = () => app.close();
    const service = Service.create({
      name: "Revisão",
      description: null,
      price: "100",
      estimatedMinutes: 45,
      isActive: true,
    });
    await repository.createService(service);
    const response = await app.inject({
      method: "PATCH",
      url: `/api/services/${service.props.id}`,
      payload: { price: "120.50" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ price: "120.50" });
  });
});
