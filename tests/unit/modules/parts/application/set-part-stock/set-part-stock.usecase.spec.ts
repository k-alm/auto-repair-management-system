import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { SetPartStockUseCase } from "@/modules/parts/application/set-part-stock/set-part-stock.usecase";
import { Part } from "@/modules/parts/domain/entities/part";
import {
  InvalidPartStockQuantityError,
  PartNotFoundError,
} from "@/modules/parts/domain/part.errors";

describe("SetPartStockUseCase", () => {
  it("replaces a part's current stock", async () => {
    const repository = new FakeCatalogRepository();
    const part = Part.create({
      name: "Filtro",
      description: null,
      sku: "FLT-1",
      price: "15",
      isActive: true,
      stockQuantity: 3,
    });
    await repository.createPart(part);

    await expect(
      new SetPartStockUseCase(repository).execute({
        id: part.props.id,
        stockQuantity: 8,
      }),
    ).resolves.toMatchObject({ stockQuantity: 8 });
  });

  it("rejects negative balances", async () => {
    await expect(
      new SetPartStockUseCase(new FakeCatalogRepository()).execute({
        id: "part-id",
        stockQuantity: -1,
      }),
    ).rejects.toBeInstanceOf(InvalidPartStockQuantityError);
  });

  it("requires an existing part", async () => {
    await expect(
      new SetPartStockUseCase(new FakeCatalogRepository()).execute({
        id: "missing",
        stockQuantity: 2,
      }),
    ).rejects.toBeInstanceOf(PartNotFoundError);
  });
});
