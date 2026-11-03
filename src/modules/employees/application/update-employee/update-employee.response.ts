import type { EmployeeRole } from "../employee-role";

export interface UpdateEmployeeResponse {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  updatedAt: Date;
}
