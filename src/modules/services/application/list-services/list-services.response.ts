import type { CreateServiceResponse } from "../create-service/create-service.response";

export interface ListServicesResponse {
  items: CreateServiceResponse[];
  page: number;
  pageSize: number;
  total: number;
}
