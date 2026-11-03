import type { EmployeeRepository } from "../../domain/employee.repository";
import { Employee } from "../../domain/entities/employee";
import {
  EmployeeAlreadyExistsError,
  InvalidEmployeeRoleError,
} from "../../domain/errors/employee-errors";
import { isEmployeeRole } from "../employee-role";
import type { CreateEmployeeInput } from "./create-employee.input";
import type { CreateEmployeeResponse } from "./create-employee.response";

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export class CreateEmployeeUseCase {
  constructor(
    private readonly employees: EmployeeRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  async execute(input: CreateEmployeeInput): Promise<CreateEmployeeResponse> {
    if (!isEmployeeRole(input.role)) {
      throw new InvalidEmployeeRoleError();
    }

    const email = input.email.trim().toLowerCase();
    if (await this.employees.existsByEmail(email)) {
      throw new EmployeeAlreadyExistsError();
    }

    const employee = Employee.create({
      name: input.name.trim(),
      email,
      role: input.role,
      passwordHash: await this.passwords.hash(input.password),
    });
    const created = await this.employees.create(employee);

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      role: input.role,
      createdAt: created.createdAt,
    };
  }
}
