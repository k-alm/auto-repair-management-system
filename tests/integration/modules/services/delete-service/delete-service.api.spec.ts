import { afterEach, describe, expect, it } from "vitest";
import { Service } from "@/modules/services/domain/entities/service";
import { createCatalogApiTestApp } from "../support/create-catalog-api-test-app";

describe("DELETE /api/services/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("deletes an unused service", async () => {
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
      method: "DELETE",
      url: `/api/services/${service.props.id}`,
    });
    expect(response.statusCode).toBe(204);
  });
});
