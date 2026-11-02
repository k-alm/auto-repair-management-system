import type { CreatePartResponse } from "../create-part/create-part.response";

export interface ListPartsResponse {
  items: CreatePartResponse[];
  page: number;
  pageSize: number;
  total: number;
}
