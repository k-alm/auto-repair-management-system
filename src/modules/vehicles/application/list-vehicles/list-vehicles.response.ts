import type { GetVehicleResponse } from "../get-vehicle/get-vehicle.response";

export interface ListVehiclesResponse {
  items: GetVehicleResponse[];
  page: number;
  pageSize: number;
  total: number;
}
