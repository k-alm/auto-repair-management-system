import { PartNotFoundError } from "../../domain/part.errors";
import type { PartRepository } from "../../domain/part.repository";
import type { DeletePartInput } from "./delete-part.input";
import type { DeletePartResponse } from "./delete-part.response";

export class DeletePartUseCase {
  constructor(private readonly parts: PartRepository) {}

  async execute(input: DeletePartInput): Promise<DeletePartResponse> {
    if (!(await this.parts.findPart(input.id))) {
      throw new PartNotFoundError();
    }
    const hasUsage = await this.parts.existsPartUsage(input.id);
    await this.parts.deletePart(input.id, hasUsage);
    return { id: input.id, deleted: true };
  }
}
