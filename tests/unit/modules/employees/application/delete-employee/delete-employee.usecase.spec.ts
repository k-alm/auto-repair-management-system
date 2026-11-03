import { FakeEmployeeRepository } from "@tests/support/fake-employee.repository";
import { describe, expect, it } from "vitest";
import { DeleteEmployeeUseCase } from "@/modules/employees/application/delete-employee/delete-employee.usecase";
import { EmployeeRole } from "@/modules/employees/application/employee-role";
import { EmployeeNotFoundError } from "@/modules/employees/domain/errors/employee-errors";

describe("DeleteEmployeeUseCase", () => {
  it("deletes an existing employee", async () => {
    const repository = new FakeEmployeeRepository();
    repository.seed({
      id: "employee-1",
      name: "Marina Souza",
      email: "marina@example.com",
      role: EmployeeRole.ATTENDANT,
    });
    const useCase = new DeleteEmployeeUseCase(repository);

    await expect(useCase.execute({ id: "employee-1" })).resolves.toEqual({
      id: "employee-1",
      deleted: true,
    });
    expect(repository.employees.has("employee-1")).toBe(false);
  });

  it("rejects deletion when the employee does not exist", async () => {
    const repository = new FakeEmployeeRepository();
    const useCase = new DeleteEmployeeUseCase(repository);

    await expect(useCase.execute({ id: "missing" })).rejects.toBeInstanceOf(EmployeeNotFoundError);
  });
});
