import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { UpdateServiceUseCase } from "@/modules/services/application/update-service/update-service.usecase";
import { Service } from "@/modules/services/domain/entities/service";
import { ServiceNotFoundError } from "@/modules/services/domain/service.errors";

describe("UpdateServiceUseCase", () => {
  it("updates supplied service fields", async () => {
    const repository = new FakeCatalogRepository();
    const service = Service.create({
      name: "Revisão",
      description: null,
      price: "50",
      estimatedMinutes: 60,
      isActive: true,
    });
    await repository.createService(service);
    await expect(
      new UpdateServiceUseCase(repository).execute({
        id: service.props.id,
        price: "75.50",
      }),
    ).resolves.toMatchObject({ price: "75.50" });
  });

  it("rejects unknown services", async () => {
    await expect(
      new UpdateServiceUseCase(new FakeCatalogRepository()).execute({
        id: "missing",
        name: "Novo",
      }),
    ).rejects.toBeInstanceOf(ServiceNotFoundError);
  });
});
