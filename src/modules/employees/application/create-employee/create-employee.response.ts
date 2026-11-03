import type { EmployeeRole } from "../employee-role";

export interface CreateEmployeeResponse {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  createdAt: Date;
}
