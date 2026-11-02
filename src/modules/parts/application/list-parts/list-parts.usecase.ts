import type { PartRepository } from "../../domain/part.repository";
import type { ListPartsInput } from "./list-parts.input";
import type { ListPartsResponse } from "./list-parts.response";

export class ListPartsUseCase {
  constructor(private readonly parts: PartRepository) {}

  async execute(input: ListPartsInput): Promise<ListPartsResponse> {
    const result = await this.parts.listParts({
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    });
    return {
      items: result.items.map(({ props }) => props),
      page: input.page,
      pageSize: input.pageSize,
      total: result.total,
    };
  }
}
