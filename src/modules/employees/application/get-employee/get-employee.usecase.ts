import type { EmployeeRepository } from "../../domain/employee.repository";
import {
  EmployeeNotFoundError,
  InvalidEmployeeRoleError,
} from "../../domain/errors/employee-errors";
import { isEmployeeRole } from "../employee-role";
import type { GetEmployeeInput } from "./get-employee.input";
import type { GetEmployeeResponse } from "./get-employee.response";

export class GetEmployeeUseCase {
  constructor(private readonly employees: EmployeeRepository) {}

  async execute(input: GetEmployeeInput): Promise<GetEmployeeResponse> {
    const employee = await this.employees.findById(input.id);

    if (!employee) {
      throw new EmployeeNotFoundError();
    }

    if (!isEmployeeRole(employee.role)) {
      throw new InvalidEmployeeRoleError();
    }

    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
  }
}
