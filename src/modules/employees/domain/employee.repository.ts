import type { Employee } from "./entities/employee";

export interface EmployeeUpdate {
  name?: string;
  email?: string;
  role?: string;
}

export interface EmployeePage {
  items: Employee[];
  total: number;
}

export interface EmployeeRepository {
  existsByEmail(email: string, exceptId?: string): Promise<boolean>;
  findById(id: string): Promise<Employee | null>;
  findRoleById(id: string): Promise<string | null>;
  list(input: { skip: number; take: number }): Promise<EmployeePage>;
  create(employee: Employee): Promise<Employee>;
  update(id: string, input: EmployeeUpdate): Promise<Employee>;
  delete(id: string): Promise<void>;
}
