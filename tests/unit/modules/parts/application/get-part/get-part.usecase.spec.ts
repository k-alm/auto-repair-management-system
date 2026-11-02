import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { GetPartUseCase } from "@/modules/parts/application/get-part/get-part.usecase";
import { Part } from "@/modules/parts/domain/entities/part";
import { PartNotFoundError } from "@/modules/parts/domain/part.errors";

describe("GetPartUseCase", () => {
  it("returns a part by id", async () => {
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
      new GetPartUseCase(repository).execute({ id: part.props.id }),
    ).resolves.toMatchObject({ id: part.props.id });
  });

  it("rejects missing parts", async () => {
    await expect(
      new GetPartUseCase(new FakeCatalogRepository()).execute({ id: "missing" }),
    ).rejects.toBeInstanceOf(PartNotFoundError);
  });
});
