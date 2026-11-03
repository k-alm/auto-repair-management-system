import { createVehicleBodySchema } from "./create-vehicle.schema";

export const updateVehicleBodySchema = createVehicleBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0);
