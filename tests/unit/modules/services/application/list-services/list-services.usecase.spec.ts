import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { ListServicesUseCase } from "@/modules/services/application/list-services/list-services.usecase";
import { Service } from "@/modules/services/domain/entities/service";

describe("ListServicesUseCase", () => {
  it("returns a paginated service collection", async () => {
    const repository = new FakeCatalogRepository();
    await repository.createService(
      Service.create({
        name: "Revisão",
        description: null,
        price: "100",
        estimatedMinutes: 90,
        isActive: true,
      }),
    );
    await expect(
      new ListServicesUseCase(repository).execute({ page: 1, pageSize: 10 }),
    ).resolves.toMatchObject({ page: 1, pageSize: 10, total: 1, items: [{ name: "Revisão" }] });
  });
});
