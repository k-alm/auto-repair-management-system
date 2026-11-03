import { FakeEmployeeRepository } from "@tests/support/fake-employee.repository";
import { describe, expect, it } from "vitest";
import { AuthorizeEmployeeManagementUseCase } from "@/modules/employees/application/authorize-employee-management/authorize-employee-management.usecase";
import { EmployeeRole } from "@/modules/employees/application/employee-role";
import { ForbiddenError, UnauthorizedError } from "@/shared/domain/errors";

describe("AuthorizeEmployeeManagementUseCase", () => {
  it("authorizes an administrator based on the current persisted role", async () => {
    const repository = new FakeEmployeeRepository();
    repository.seed({
      id: "admin-1",
      name: "Admin",
      email: "admin@example.com",
      role: EmployeeRole.ADMIN,
    });
    const useCase = new AuthorizeEmployeeManagementUseCase(repository);

    await expect(useCase.execute({ employeeId: "admin-1" })).resolves.toEqual({
      authorized: true,
    });
  });

  it("forbids an employee whose current role is not ADMIN", async () => {
    const repository = new FakeEmployeeRepository();
    repository.seed({
      id: "attendant-1",
      name: "Attendant",
      email: "attendant@example.com",
      role: EmployeeRole.ATTENDANT,
    });
    const useCase = new AuthorizeEmployeeManagementUseCase(repository);

    await expect(useCase.execute({ employeeId: "attendant-1" })).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("rejects an employee that is no longer active", async () => {
    const useCase = new AuthorizeEmployeeManagementUseCase(new FakeEmployeeRepository());

    await expect(useCase.execute({ employeeId: "missing" })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
