import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { ListPartsUseCase } from "@/modules/parts/application/list-parts/list-parts.usecase";
import { Part } from "@/modules/parts/domain/entities/part";

describe("ListPartsUseCase", () => {
  it("returns paginated parts", async () => {
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
      new ListPartsUseCase(repository).execute({ page: 1, pageSize: 5 }),
    ).resolves.toMatchObject({ total: 1, items: [{ sku: "F-1" }] });
  });
});
