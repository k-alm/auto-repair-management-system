import { Vehicle } from "../../domain/entities/vehicle";
import {
  VehicleAlreadyExistsError,
  VehicleCustomerNotFoundError,
} from "../../domain/errors/vehicle-errors";
import type { VehicleRepository } from "../../domain/vehicle.repository";
import type { CreateVehicleInput } from "./create-vehicle.input";
import type { CreateVehicleResponse } from "./create-vehicle.response";

export class CreateVehicleUseCase {
  constructor(private readonly vehicles: VehicleRepository) {}

  async execute(input: CreateVehicleInput): Promise<CreateVehicleResponse> {
    const vehicle = Vehicle.create(input);
    if (!(await this.vehicles.customerExists(input.customerId))) {
      throw new VehicleCustomerNotFoundError();
    }
    if (await this.vehicles.existsByPlate(vehicle.plate)) {
      throw new VehicleAlreadyExistsError();
    }
    return this.toResponse(await this.vehicles.create(vehicle));
  }

  private toResponse(vehicle: Vehicle): CreateVehicleResponse {
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
