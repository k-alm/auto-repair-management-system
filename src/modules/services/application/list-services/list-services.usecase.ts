import type { ServiceRepository } from "../../domain/service.repository";
import type { ListServicesInput } from "./list-services.input";
import type { ListServicesResponse } from "./list-services.response";

export class ListServicesUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(input: ListServicesInput): Promise<ListServicesResponse> {
    const result = await this.services.listServices({
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
