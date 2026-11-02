import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { DeleteServiceUseCase } from "@/modules/services/application/delete-service/delete-service.usecase";
import { Service } from "@/modules/services/domain/entities/service";

describe("DeleteServiceUseCase", () => {
  it("soft deletes services already used by an order", async () => {
    const repository = new FakeCatalogRepository();
    const service = Service.create({
      name: "Revisão",
      description: null,
      price: "50",
      estimatedMinutes: 60,
      isActive: true,
    });
    await repository.createService(service);
    repository.serviceHasUsage = true;
    await new DeleteServiceUseCase(repository).execute({ id: service.props.id });
    expect(repository.servicePreserved).toBe(true);
    expect(repository.services.get(service.props.id)?.props.isActive).toBe(false);
  });
});
