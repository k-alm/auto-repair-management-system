import type { VehicleRepository } from "../../domain/vehicle.repository";
import type { ListVehiclesInput } from "./list-vehicles.input";
import type { ListVehiclesResponse } from "./list-vehicles.response";

export class ListVehiclesUseCase {
  constructor(private readonly vehicles: VehicleRepository) {}

  async execute(input: ListVehiclesInput): Promise<ListVehiclesResponse> {
    const result = await this.vehicles.list({
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      customerId: input.customerId,
    });
    return {
      items: result.items.map((vehicle) => ({
        id: vehicle.id,
        customerId: vehicle.customerId,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
      })),
      page: input.page,
      pageSize: input.pageSize,
      total: result.total,
    };
  }
}
