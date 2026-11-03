import { ForbiddenError, UnauthorizedError } from "@/shared/domain/errors";
import type { EmployeeRepository } from "../../domain/employee.repository";
import { EmployeeRole } from "../employee-role";
import type { AuthorizeEmployeeManagementInput } from "./authorize-employee-management.input";
import type { AuthorizeEmployeeManagementResponse } from "./authorize-employee-management.response";

export class AuthorizeEmployeeManagementUseCase {
  constructor(private readonly employees: EmployeeRepository) {}

  async execute(
    input: AuthorizeEmployeeManagementInput,
  ): Promise<AuthorizeEmployeeManagementResponse> {
    const role = await this.employees.findRoleById(input.employeeId);

    if (role === null) {
      throw new UnauthorizedError("Funcionário não autorizado");
    }

    if (role !== EmployeeRole.ADMIN) {
      throw new ForbiddenError("Acesso restrito a administradores");
    }

    return { authorized: true };
  }
}
