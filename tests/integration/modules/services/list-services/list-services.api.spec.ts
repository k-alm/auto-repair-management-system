import { afterEach, describe, expect, it } from "vitest";
import { Service } from "@/modules/services/domain/entities/service";
import { createCatalogApiTestApp } from "../support/create-catalog-api-test-app";

describe("GET /api/services", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns a paginated list of services", async () => {
    const { app, repository } = await createCatalogApiTestApp();
    close = () => app.close();
    await repository.createService(
      Service.create({
        name: "Revisão",
        description: null,
        price: "100",
        estimatedMinutes: 45,
        isActive: true,
      }),
    );
    const response = await app.inject({ method: "GET", url: "/api/services?page=1&pageSize=10" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ total: 1, items: [{ name: "Revisão" }] });
  });
});
