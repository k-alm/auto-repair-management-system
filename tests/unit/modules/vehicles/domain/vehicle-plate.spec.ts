import { describe, expect, it } from "vitest";
import {
  InvalidVehiclePlateError,
  VehiclePlate,
} from "@/modules/vehicles/domain/value-objects/vehicle-plate";

describe("VehiclePlate", () => {
  it("normalizes a valid Mercosur plate", () => {
    expect(VehiclePlate.create("abc-1d23").value).toBe("ABC1D23");
  });

  it("accepts a valid legacy plate", () => {
    expect(VehiclePlate.create("abc-1234").value).toBe("ABC1234");
  });

  it("rejects an invalid plate", () => {
    expect(() => VehiclePlate.create("ABC-12D3")).toThrow(InvalidVehiclePlateError);
  });
});
