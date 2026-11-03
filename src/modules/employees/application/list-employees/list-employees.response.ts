import type { EmployeeRole } from "../employee-role";

export interface ListEmployeesResponse {
  items: {
    id: string;
    name: string;
    email: string;
    role: EmployeeRole;
  }[];
  page: number;
  pageSize: number;
  total: number;
}
