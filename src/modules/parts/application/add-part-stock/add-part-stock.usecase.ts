import { normalizePartStockQuantity } from "../../domain/entities/part";
import { InvalidPartStockEntryError, PartNotFoundError } from "../../domain/part.errors";
import type { PartRepository } from "../../domain/part.repository";
import type { AddPartStockInput } from "./add-part-stock.input";

export class AddPartStockUseCase {
  constructor(private readonly parts: PartRepository) {}

  async execute(input: AddPartStockInput) {
    const quantity = normalizePartStockQuantity(input.quantity);
    if (quantity === 0) throw new InvalidPartStockEntryError();
    if (!(await this.parts.findPart(input.id))) throw new PartNotFoundError();

    return (await this.parts.addPartStock(input.id, input.quantity)).props;
  }
}
