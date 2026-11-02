import { normalizeServicePrice } from "../../domain/entities/service";
import { ServiceNotFoundError } from "../../domain/service.errors";
import type { ServiceRepository } from "../../domain/service.repository";
import type { UpdateServiceInput } from "./update-service.input";
import type { UpdateServiceResponse } from "./update-service.response";

export class UpdateServiceUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(input: UpdateServiceInput): Promise<UpdateServiceResponse> {
    if (!(await this.services.findService(input.id))) {
      throw new ServiceNotFoundError();
    }
    const { id, ...changes } = input;
    const updated = await this.services.updateService(id, {
      ...changes,
      ...(changes.name !== undefined && { name: changes.name.trim() }),
      ...(changes.price !== undefined && { price: normalizeServicePrice(changes.price) }),
    });
    return updated.props;
  }
}
