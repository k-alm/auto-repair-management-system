import {
  VehicleHasWorkOrdersError,
  VehicleNotFoundError,
} from "../../domain/errors/vehicle-errors";
import type { VehicleRepository } from "../../domain/vehicle.repository";
import type { DeleteVehicleInput } from "./delete-vehicle.input";
import type { DeleteVehicleResponse } from "./delete-vehicle.response";

export class DeleteVehicleUseCase {
  constructor(private readonly vehicles: VehicleRepository) {}

  async execute(input: DeleteVehicleInput): Promise<DeleteVehicleResponse> {
    if (!(await this.vehicles.findById(input.id))) throw new VehicleNotFoundError();
    if (await this.vehicles.hasWorkOrders(input.id)) throw new VehicleHasWorkOrdersError();
    await this.vehicles.delete(input.id);
    return { id: input.id, deleted: true };
  }
}
