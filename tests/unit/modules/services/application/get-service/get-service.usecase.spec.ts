import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { GetServiceUseCase } from "@/modules/services/application/get-service/get-service.usecase";
import { Service } from "@/modules/services/domain/entities/service";
import { ServiceNotFoundError } from "@/modules/services/domain/service.errors";

describe("GetServiceUseCase", () => {
  it("returns a service by id", async () => {
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
      new GetServiceUseCase(repository).execute({ id: service.props.id }),
    ).resolves.toMatchObject({ id: service.props.id });
  });

  it("rejects missing services", async () => {
    await expect(
      new GetServiceUseCase(new FakeCatalogRepository()).execute({ id: "missing" }),
    ).rejects.toBeInstanceOf(ServiceNotFoundError);
  });
});
