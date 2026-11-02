import { ServiceNotFoundError } from "../../domain/service.errors";
import type { ServiceRepository } from "../../domain/service.repository";
import type { GetServiceInput } from "./get-service.input";
import type { GetServiceResponse } from "./get-service.response";

export class GetServiceUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(input: GetServiceInput): Promise<GetServiceResponse> {
    const service = await this.services.findService(input.id);
    if (!service) throw new ServiceNotFoundError();
    return service.props;
  }
}
