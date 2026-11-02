import { Part } from "../../domain/entities/part";
import { DuplicatePartSkuError } from "../../domain/part.errors";
import type { PartRepository } from "../../domain/part.repository";
import type { CreatePartInput } from "./create-part.input";
import type { CreatePartResponse } from "./create-part.response";

export class CreatePartUseCase {
  constructor(private readonly parts: PartRepository) {}

  async execute(input: CreatePartInput): Promise<CreatePartResponse> {
    const part = Part.create({
      ...input,
      description: input.description ?? null,
    });
    if (await this.parts.existsSku(part.props.sku)) throw new DuplicatePartSkuError();
    return (await this.parts.createPart(part)).props;
  }
}
