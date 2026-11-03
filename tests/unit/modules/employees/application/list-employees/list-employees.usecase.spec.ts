import { FakeEmployeeRepository } from "@tests/support/fake-employee.repository";
import { describe, expect, it } from "vitest";
import { EmployeeRole } from "@/modules/employees/application/employee-role";
import { ListEmployeesUseCase } from "@/modules/employees/application/list-employees/list-employees.usecase";

describe("ListEmployeesUseCase", () => {
  it("returns a paginated list without password hashes", async () => {
    const repository = new FakeEmployeeRepository();
    repository.seed({
      id: "employee-1",
      name: "Ana Souza",
      email: "ana@example.com",
      role: EmployeeRole.ADMIN,
    });
    repository.seed({
      id: "employee-2",
      name: "Marina Souza",
      email: "marina@example.com",
      role: EmployeeRole.ATTENDANT,
    });
    const useCase = new ListEmployeesUseCase(repository);

    const response = await useCase.execute({ page: 2, pageSize: 1 });

    expect(response).toMatchObject({
      items: [{ id: "employee-2", role: EmployeeRole.ATTENDANT }],
      page: 2,
      pageSize: 1,
      total: 2,
    });
    expect(response.items[0]).not.toHaveProperty("passwordHash");
  });
});
