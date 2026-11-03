import type { EmployeeRepository } from "../../domain/employee.repository";
import { InvalidEmployeeRoleError } from "../../domain/errors/employee-errors";
import { isEmployeeRole } from "../employee-role";
import type { ListEmployeesInput } from "./list-employees.input";
import type { ListEmployeesResponse } from "./list-employees.response";

export class ListEmployeesUseCase {
  constructor(private readonly employees: EmployeeRepository) {}

  async execute(input: ListEmployeesInput): Promise<ListEmployeesResponse> {
    const result = await this.employees.list({
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    });
    const items = result.items.map((employee) => {
      if (!isEmployeeRole(employee.role)) {
        throw new InvalidEmployeeRoleError();
      }

      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      };
    });

    return {
      items,
      page: input.page,
      pageSize: input.pageSize,
      total: result.total,
    };
  }
}
