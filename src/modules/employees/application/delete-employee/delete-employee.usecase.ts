import type { EmployeeRepository } from "../../domain/employee.repository";
import { EmployeeNotFoundError } from "../../domain/errors/employee-errors";
import type { DeleteEmployeeInput } from "./delete-employee.input";
import type { DeleteEmployeeResponse } from "./delete-employee.response";

export class DeleteEmployeeUseCase {
  constructor(private readonly employees: EmployeeRepository) {}

  async execute(input: DeleteEmployeeInput): Promise<DeleteEmployeeResponse> {
    if (!(await this.employees.findById(input.id))) {
      throw new EmployeeNotFoundError();
    }

    await this.employees.delete(input.id);
    return { id: input.id, deleted: true };
  }
}
