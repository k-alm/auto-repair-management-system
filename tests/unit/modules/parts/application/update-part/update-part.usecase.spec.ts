import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { UpdatePartUseCase } from "@/modules/parts/application/update-part/update-part.usecase";
import { Part } from "@/modules/parts/domain/entities/part";
import { DuplicatePartSkuError } from "@/modules/parts/domain/part.errors";

describe("UpdatePartUseCase", () => {
  it("updates part properties and formats monetary values", async () => {
    const repository = new FakeCatalogRepository();
    const part = Part.create({
      name: "Filtro",
      description: null,
      sku: "F-1",
      price: "15",
      isActive: true,
    });
    await repository.createPart(part);
    await expect(
      new UpdatePartUseCase(repository).execute({
        id: part.props.id,
        price: "18",
      }),
    ).resolves.toMatchObject({ price: "18.00" });
  });

  it("rejects a SKU used by a different part", async () => {
    const repository = new FakeCatalogRepository();
    const first = Part.create({
      name: "Filtro",
      description: null,
      sku: "F-1",
      price: "15",
      isActive: true,
    });
    const second = Part.create({
      name: "Pastilha",
      description: null,
      sku: "P-1",
      price: "30",
      isActive: true,
    });
    await repository.createPart(first);
    await repository.createPart(second);
    await expect(
      new UpdatePartUseCase(repository).execute({
        id: second.props.id,
        sku: first.props.sku,
      }),
    ).rejects.toBeInstanceOf(DuplicatePartSkuError);
  });
});
