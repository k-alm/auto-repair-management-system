import { AppError } from "@/shared/domain/errors/app.error";

export class InvalidVehiclePlateError extends AppError {
  constructor() {
    super("Placa inválida", 422, "INVALID_VEHICLE_PLATE");
  }
}

export class VehiclePlate {
  private constructor(readonly value: string) {}

  static create(input: string) {
    const value = input.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const valid = /^[A-Z]{3}\d{4}$/.test(value) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(value);
    if (!valid) throw new InvalidVehiclePlateError();
    return new VehiclePlate(value);
  }
}
