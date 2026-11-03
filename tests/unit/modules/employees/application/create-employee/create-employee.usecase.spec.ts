import { FakeEmployeeRepository } from "@tests/support/fake-employee.repository";
import { describe, expect, it, vi } from "vitest";
import { CreateEmployeeUseCase } from "@/modules/employees/application/create-employee/create-employee.usecase";
import { EmployeeRole } from "@/modules/employees/application/employee-role";
import {
  EmployeeAlreadyExistsError,
  InvalidEmployeeRoleError,
} from "@/modules/employees/domain/errors/employee-errors";

describe("CreateEmployeeUseCase", () => {
  it("creates an employee with a normalized email and a password hash", async () => {
    const repository = new FakeEmployeeRepository();
    const passwords = { hash: vi.fn(async () => "secure-hash") };
    const useCase = new CreateEmployeeUseCase(repository, passwords);

    const response = await useCase.execute({
      name: "  Marina Souza  ",
      email: "  MARINA.SOUZA@example.com ",
      role: EmployeeRole.ATTENDANT,
      password: "DemoEmployee#2026",
    });

    const storedEmployee = [...repository.employees.values()][0];
    expect(response).toMatchObject({
      name: "Marina Souza",
      email: "marina.souza@example.com",
      role: EmployeeRole.ATTENDANT,
    });
    expect(response).not.toHaveProperty("passwordHash");
    expect(storedEmployee.passwordHash).toBe("secure-hash");
    expect(passwords.hash).toHaveBeenCalledWith("DemoEmployee#2026");
  });

  it("rejects an email that already exists", async () => {
    const repository = new FakeEmployeeRepository();
    repository.seed({
      id: "employee-1",
      name: "Marina Souza",
      email: "marina.souza@example.com",
      role: EmployeeRole.ADMIN,
    });
    const passwords = { hash: vi.fn(async () => "secure-hash") };
    const useCase = new CreateEmployeeUseCase(repository, passwords);

    await expect(
      useCase.execute({
        name: "Marina Souza",
        email: " MARINA.SOUZA@example.com ",
        role: EmployeeRole.ATTENDANT,
        password: "DemoEmployee#2026",
      }),
    ).rejects.toBeInstanceOf(EmployeeAlreadyExistsError);
    expect(passwords.hash).not.toHaveBeenCalled();
  });

  it("rejects a role outside the application enum", async () => {
    const repository = new FakeEmployeeRepository();
    const passwords = { hash: vi.fn(async () => "secure-hash") };
    const useCase = new CreateEmployeeUseCase(repository, passwords);

    await expect(
      useCase.execute({
        name: "Marina Souza",
        email: "marina.souza@example.com",
        role: "INVALID" as EmployeeRole,
        password: "DemoEmployee#2026",
      }),
    ).rejects.toBeInstanceOf(InvalidEmployeeRoleError);
    expect(repository.employees.size).toBe(0);
    expect(passwords.hash).not.toHaveBeenCalled();
  });
});
