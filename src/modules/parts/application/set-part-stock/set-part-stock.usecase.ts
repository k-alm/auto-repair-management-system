import { normalizePartStockQuantity } from "../../domain/entities/part";
import { PartNotFoundError } from "../../domain/part.errors";
import type { PartRepository } from "../../domain/part.repository";
import type { SetPartStockInput } from "./set-part-stock.input";

export class SetPartStockUseCase {
  constructor(private readonly parts: PartRepository) {}

  async execute(input: SetPartStockInput) {
    const stockQuantity = normalizePartStockQuantity(input.stockQuantity);
    if (!(await this.parts.findPart(input.id))) throw new PartNotFoundError();

    return (await this.parts.setPartStockQuantity(input.id, stockQuantity)).props;
  }
}
