import type { EmployeeRole } from "../employee-role";

export interface CreateEmployeeInput {
  name: string;
  email: string;
  role: EmployeeRole;
  password: string;
}
