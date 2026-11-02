import { VehicleNotFoundError } from "../../domain/errors/vehicle-errors";
import type { VehicleRepository } from "../../domain/vehicle.repository";
import type { GetVehicleInput } from "./get-vehicle.input";
import type { GetVehicleResponse } from "./get-vehicle.response";

export class GetVehicleUseCase {
  constructor(private readonly vehicles: VehicleRepository) {}

  async execute(input: GetVehicleInput): Promise<GetVehicleResponse> {
    const vehicle = await this.vehicles.findById(input.id);
    if (!vehicle) throw new VehicleNotFoundError();
    return {
      id: vehicle.id,
      customerId: vehicle.customerId,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
    };
  }
}
