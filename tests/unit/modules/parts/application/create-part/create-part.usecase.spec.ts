import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { CreatePartUseCase } from "@/modules/parts/application/create-part/create-part.usecase";
import { Part } from "@/modules/parts/domain/entities/part";
import { DuplicatePartSkuError } from "@/modules/parts/domain/part.errors";

describe("CreatePartUseCase", () => {
  it("creates a piece without stock tracking", async () => {
    const result = await new CreatePartUseCase(new FakeCatalogRepository()).execute({
      name: "Filtro",
      sku: "F-1",
      price: "15.5",
      isActive: true,
    });
    expect(result).toMatchObject({ name: "Filtro", sku: "F-1", price: "15.5" });
    expect(result).not.toHaveProperty("stockQuantity");
  });

  it("rejects duplicate SKUs", async () => {
    const repository = new FakeCatalogRepository();
    await repository.createPart(
      Part.create({
        name: "Filtro",
        description: null,
        sku: "F-1",
        price: "15",
        isActive: true,
      }),
    );
    await expect(
      new CreatePartUseCase(repository).execute({
        name: "Outro filtro",
        sku: "F-1",
        price: "20",
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(DuplicatePartSkuError);
  });
});
