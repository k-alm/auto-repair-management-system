import { ServiceNotFoundError } from "../../domain/service.errors";
import type { ServiceRepository } from "../../domain/service.repository";
import type { DeleteServiceInput } from "./delete-service.input";
import type { DeleteServiceResponse } from "./delete-service.response";

export class DeleteServiceUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(input: DeleteServiceInput): Promise<DeleteServiceResponse> {
    if (!(await this.services.findService(input.id))) {
      throw new ServiceNotFoundError();
    }
    const hasUsage = await this.services.existsServiceUsage(input.id);
    await this.services.deleteService(input.id, hasUsage);
    return { id: input.id, deleted: true };
  }
}
