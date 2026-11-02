import { normalizePartPrice } from "../../domain/entities/part";
import { DuplicatePartSkuError, PartNotFoundError } from "../../domain/part.errors";
import type { PartRepository } from "../../domain/part.repository";
import type { UpdatePartInput } from "./update-part.input";
import type { UpdatePartResponse } from "./update-part.response";

export class UpdatePartUseCase {
  constructor(private readonly parts: PartRepository) {}

  async execute(input: UpdatePartInput): Promise<UpdatePartResponse> {
    const current = await this.parts.findPart(input.id);
    if (!current) throw new PartNotFoundError();
    const { id, ...changes } = input;
    const sku = changes.sku?.trim();
    if (sku && sku !== current.props.sku && (await this.parts.existsSku(sku, id))) {
      throw new DuplicatePartSkuError();
    }
    const updated = await this.parts.updatePart(id, {
      ...changes,
      ...(changes.name !== undefined && { name: changes.name.trim() }),
      ...(sku !== undefined && { sku }),
      ...(changes.price !== undefined && { price: normalizePartPrice(changes.price) }),
    });
    return updated.props;
  }
}
