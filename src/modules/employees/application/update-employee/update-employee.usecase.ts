import type { EmployeeRepository } from "../../domain/employee.repository";
import {
  EmployeeAlreadyExistsError,
  EmployeeNotFoundError,
  EmployeeSelfRoleChangeForbiddenError,
  InvalidEmployeeRoleError,
} from "../../domain/errors/employee-errors";
import { isEmployeeRole } from "../employee-role";
import type { UpdateEmployeeInput } from "./update-employee.input";
import type { UpdateEmployeeResponse } from "./update-employee.response";

export class UpdateEmployeeUseCase {
  constructor(private readonly employees: EmployeeRepository) {}

  async execute(input: UpdateEmployeeInput): Promise<UpdateEmployeeResponse> {
    const current = await this.employees.findById(input.id);

    if (!current) {
      throw new EmployeeNotFoundError();
    }

    const currentRole = current.role;
    if (!isEmployeeRole(currentRole)) {
      throw new InvalidEmployeeRoleError();
    }

    if (input.role !== undefined && !isEmployeeRole(input.role)) {
      throw new InvalidEmployeeRoleError();
    }

    if (input.actorId === input.id && input.role !== undefined && input.role !== current.role) {
      throw new EmployeeSelfRoleChangeForbiddenError();
    }

    const email = input.email?.trim().toLowerCase();
    if (
      email !== undefined &&
      email !== current.email &&
      (await this.employees.existsByEmail(email, input.id))
    ) {
      throw new EmployeeAlreadyExistsError();
    }

    const employee = await this.employees.update(input.id, {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(email !== undefined && { email }),
      ...(input.role !== undefined && { role: input.role }),
    });

    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: input.role ?? currentRole,
      updatedAt: employee.updatedAt,
    };
  }
}
