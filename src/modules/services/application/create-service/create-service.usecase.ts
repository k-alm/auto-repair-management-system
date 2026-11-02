import { Service } from "../../domain/entities/service";
import type { ServiceRepository } from "../../domain/service.repository";
import type { CreateServiceInput } from "./create-service.input";
import type { CreateServiceResponse } from "./create-service.response";

export class CreateServiceUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(input: CreateServiceInput): Promise<CreateServiceResponse> {
    const service = await this.services.createService(
      Service.create({
        ...input,
        description: input.description ?? null,
      }),
    );
    return service.props;
  }
}
