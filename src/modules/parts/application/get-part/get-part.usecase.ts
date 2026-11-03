import { PartNotFoundError } from "../../domain/part.errors";
import type { PartRepository } from "../../domain/part.repository";
import type { GetPartInput } from "./get-part.input";
import type { GetPartResponse } from "./get-part.response";

export class GetPartUseCase {
  constructor(private readonly parts: PartRepository) {}

  async execute(input: GetPartInput): Promise<GetPartResponse> {
    const part = await this.parts.findPart(input.id);
    if (!part) throw new PartNotFoundError();
    return part.props;
  }
}
