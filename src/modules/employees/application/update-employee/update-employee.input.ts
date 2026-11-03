import type { EmployeeRole } from "../employee-role";

export interface UpdateEmployeeInput {
  id: string;
  actorId: string;
  name?: string;
  email?: string;
  role?: EmployeeRole;
}
