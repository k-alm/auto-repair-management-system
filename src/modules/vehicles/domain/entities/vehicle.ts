import { randomUUID } from "node:crypto";
import { VehiclePlate } from "../value-objects/vehicle-plate";

export interface VehicleProps {
  id: string;
  customerId: string;
  plate: VehiclePlate;
  brand: string;
  model: string;
  year: number;
}

export interface NewVehicleProps {
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
}

export class Vehicle {
  private constructor(readonly props: VehicleProps) {}

  static create(input: NewVehicleProps) {
    return new Vehicle({
      id: randomUUID(),
      customerId: input.customerId,
      plate: VehiclePlate.create(input.plate),
      brand: input.brand.trim(),
      model: input.model.trim(),
      year: input.year,
    });
  }

  static restore(input: VehicleProps) {
    return new Vehicle(input);
  }

  get id() {
    return this.props.id;
  }
  get customerId() {
    return this.props.customerId;
  }
  get plate() {
    return this.props.plate.value;
  }
  get brand() {
    return this.props.brand;
  }
  get model() {
    return this.props.model;
  }
  get year() {
    return this.props.year;
  }
}
