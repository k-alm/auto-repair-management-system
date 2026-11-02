import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import { describe, expect, it } from "vitest";
import { DeletePartUseCase } from "@/modules/parts/application/delete-part/delete-part.usecase";
import { Part } from "@/modules/parts/domain/entities/part";

describe("DeletePartUseCase", () => {
  it("preserves parts used in completed work", async () => {
    const repository = new FakeCatalogRepository();
    const part = Part.create({
      name: "Filtro",
      description: null,
      sku: "F-1",
      price: "15",
      isActive: true,
    });
    await repository.createPart(part);
    repository.partHasUsage = true;
    await new DeletePartUseCase(repository).execute({ id: part.props.id });
    expect(repository.partPreserved).toBe(true);
    expect(repository.parts.get(part.props.id)?.props.isActive).toBe(false);
  });
});
