import {
  VehicleAlreadyExistsError,
  VehicleCustomerNotFoundError,
  VehicleNotFoundError,
  VehicleOwnerChangeNotAllowedError,
} from "../../domain/errors/vehicle-errors";
import { VehiclePlate } from "../../domain/value-objects/vehicle-plate";
import type { VehicleRepository } from "../../domain/vehicle.repository";
import type { UpdateVehicleInput } from "./update-vehicle.input";
import type { UpdateVehicleResponse } from "./update-vehicle.response";

export class UpdateVehicleUseCase {
  constructor(private readonly vehicles: VehicleRepository) {}

  async execute(input: UpdateVehicleInput): Promise<UpdateVehicleResponse> {
    const current = await this.vehicles.findById(input.id);
    if (!current) throw new VehicleNotFoundError();

    if (input.customerId && input.customerId !== current.customerId) {
      if (await this.vehicles.hasWorkOrders(input.id)) {
        throw new VehicleOwnerChangeNotAllowedError();
      }
      if (!(await this.vehicles.customerExists(input.customerId))) {
        throw new VehicleCustomerNotFoundError();
      }
    }

    const plate = input.plate ? VehiclePlate.create(input.plate).value : undefined;
    if (plate && plate !== current.plate && (await this.vehicles.existsByPlate(plate))) {
      throw new VehicleAlreadyExistsError();
    }

    const updated = await this.vehicles.update(input.id, {
      ...(input.customerId !== undefined && { customerId: input.customerId }),
      ...(plate !== undefined && { plate }),
      ...(input.brand !== undefined && { brand: input.brand.trim() }),
      ...(input.model !== undefined && { model: input.model.trim() }),
      ...(input.year !== undefined && { year: input.year }),
    });

    return {
      id: updated.id,
      customerId: updated.customerId,
      plate: updated.plate,
      brand: updated.brand,
      model: updated.model,
      year: updated.year,
    };
  }
}
