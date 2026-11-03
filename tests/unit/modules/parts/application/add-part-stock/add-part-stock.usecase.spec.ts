import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { AddPartStockUseCase } from "@/modules/parts/application/add-part-stock/add-part-stock.usecase";
import { Part } from "@/modules/parts/domain/entities/part";
import {
  InvalidPartStockEntryError,
  InvalidPartStockQuantityError,
  PartNotFoundError,
} from "@/modules/parts/domain/part.errors";

describe("AddPartStockUseCase", () => {
  it("adds received units to the current balance", async () => {
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
      new AddPartStockUseCase(repository).execute({
        id: part.props.id,
        quantity: 5,
      }),
    ).resolves.toMatchObject({ stockQuantity: 8 });
  });

  it("rejects zero entries", async () => {
    await expect(
      new AddPartStockUseCase(new FakeCatalogRepository()).execute({
        id: "part-id",
        quantity: 0,
      }),
    ).rejects.toBeInstanceOf(InvalidPartStockEntryError);
  });

  it("rejects invalid quantities", async () => {
    await expect(
      new AddPartStockUseCase(new FakeCatalogRepository()).execute({
        id: "part-id",
        quantity: -2,
      }),
    ).rejects.toBeInstanceOf(InvalidPartStockQuantityError);
  });

  it("requires an existing part", async () => {
    await expect(
      new AddPartStockUseCase(new FakeCatalogRepository()).execute({
        id: "missing",
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(PartNotFoundError);
  });
});
