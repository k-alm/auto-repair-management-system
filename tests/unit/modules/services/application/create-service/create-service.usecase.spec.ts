import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { CreateServiceUseCase } from "@/modules/services/application/create-service/create-service.usecase";

describe("CreateServiceUseCase", () => {
  it("creates a service with normalized values", async () => {
    const repository = new FakeCatalogRepository();
    const result = await new CreateServiceUseCase(repository).execute({
      name: " Revisão ",
      price: "100",
      estimatedMinutes: 90,
      isActive: true,
    });
    expect(result).toMatchObject({ name: "Revisão", price: "100.00", description: null });
  });

  it("rejects malformed or negative prices", async () => {
    await expect(
      new CreateServiceUseCase(new FakeCatalogRepository()).execute({
        name: "Revisão",
        price: "-1",
        estimatedMinutes: 90,
        isActive: true,
      }),
    ).rejects.toThrow();
  });
});
