import { FakeEmployeeRepository } from "@tests/support/fake-employee.repository";
import { describe, expect, it } from "vitest";
import { EmployeeRole } from "@/modules/employees/application/employee-role";
import { GetEmployeeUseCase } from "@/modules/employees/application/get-employee/get-employee.usecase";
import { EmployeeNotFoundError } from "@/modules/employees/domain/errors/employee-errors";

describe("GetEmployeeUseCase", () => {
  it("returns an employee without the password hash", async () => {
    const repository = new FakeEmployeeRepository();
    repository.seed({
      id: "employee-1",
      name: "Marina Souza",
      email: "marina@example.com",
      role: EmployeeRole.ATTENDANT,
    });
    const useCase = new GetEmployeeUseCase(repository);

    const response = await useCase.execute({ id: "employee-1" });

    expect(response).toMatchObject({ id: "employee-1", role: EmployeeRole.ATTENDANT });
    expect(response).not.toHaveProperty("passwordHash");
  });

  it("throws when the employee does not exist", async () => {
    const useCase = new GetEmployeeUseCase(new FakeEmployeeRepository());

    await expect(useCase.execute({ id: "missing" })).rejects.toBeInstanceOf(EmployeeNotFoundError);
  });
});
