import type { Vehicle } from "./entities/vehicle";

export interface VehicleUpdate {
  customerId?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
}

export interface VehiclePage {
  items: Vehicle[];
  total: number;
}

export interface VehicleRepository {
  customerExists(id: string): Promise<boolean>;
  existsByPlate(plate: string): Promise<boolean>;
  findById(id: string): Promise<Vehicle | null>;
  list(input: { skip: number; take: number; customerId?: string }): Promise<VehiclePage>;
  create(vehicle: Vehicle): Promise<Vehicle>;
  update(id: string, input: VehicleUpdate): Promise<Vehicle>;
  hasWorkOrders(id: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
