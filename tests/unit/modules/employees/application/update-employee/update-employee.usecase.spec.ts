import { FakeEmployeeRepository } from "@tests/support/fake-employee.repository";
import { describe, expect, it } from "vitest";
import { EmployeeRole } from "@/modules/employees/application/employee-role";
import { UpdateEmployeeUseCase } from "@/modules/employees/application/update-employee/update-employee.usecase";
import {
  EmployeeAlreadyExistsError,
  EmployeeSelfRoleChangeForbiddenError,
} from "@/modules/employees/domain/errors/employee-errors";

describe("UpdateEmployeeUseCase", () => {
  it("updates an employee and normalizes its email", async () => {
    const repository = new FakeEmployeeRepository();
    const employee = repository.seed({
      id: "employee-1",
      name: "Marina Souza",
      email: "marina.souza@example.com",
      role: EmployeeRole.ATTENDANT,
    });
    const useCase = new UpdateEmployeeUseCase(repository);

    const response = await useCase.execute({
      id: employee.id,
      actorId: "admin-1",
      name: "Marina Santos",
      email: " MARINA.SANTOS@example.com ",
      role: EmployeeRole.MECHANIC,
    });

    expect(response).toMatchObject({
      name: "Marina Santos",
      email: "marina.santos@example.com",
      role: EmployeeRole.MECHANIC,
    });
  });

  it("prevents an administrator from changing their own role", async () => {
    const repository = new FakeEmployeeRepository();
    repository.seed({
      id: "admin-1",
      name: "Admin",
      email: "admin@example.com",
      role: EmployeeRole.ADMIN,
    });
    const useCase = new UpdateEmployeeUseCase(repository);

    await expect(
      useCase.execute({
        id: "admin-1",
        actorId: "admin-1",
        role: EmployeeRole.ATTENDANT,
      }),
    ).rejects.toBeInstanceOf(EmployeeSelfRoleChangeForbiddenError);
    expect(repository.employees.get("admin-1")?.role).toBe(EmployeeRole.ADMIN);
  });

  it("rejects a duplicate email during update", async () => {
    const repository = new FakeEmployeeRepository();
    repository.seed({
      id: "employee-1",
      name: "Marina",
      email: "marina@example.com",
      role: EmployeeRole.ATTENDANT,
    });
    repository.seed({
      id: "employee-2",
      name: "João",
      email: "joao@example.com",
      role: EmployeeRole.MECHANIC,
    });
    const useCase = new UpdateEmployeeUseCase(repository);

    await expect(
      useCase.execute({
        id: "employee-1",
        actorId: "admin-1",
        email: "JOAO@example.com",
      }),
    ).rejects.toBeInstanceOf(EmployeeAlreadyExistsError);
  });
});
