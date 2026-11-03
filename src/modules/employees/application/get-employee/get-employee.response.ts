import type { EmployeeRole } from "../employee-role";

export interface GetEmployeeResponse {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  createdAt: Date;
  updatedAt: Date;
}
