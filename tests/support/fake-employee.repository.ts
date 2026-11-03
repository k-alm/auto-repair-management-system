import type {
  EmployeePage,
  EmployeeRepository,
  EmployeeUpdate,
} from "@/modules/employees/domain/employee.repository";
import { Employee } from "@/modules/employees/domain/entities/employee";

export class FakeEmployeeRepository implements EmployeeRepository {
  readonly employees = new Map<string, Employee>();

  async existsByEmail(email: string, exceptId?: string) {
    return [...this.employees.values()].some(
      (employee) => employee.email === email && employee.id !== exceptId,
    );
  }

  async findById(id: string) {
    return this.employees.get(id) ?? null;
  }

  async findRoleById(id: string) {
    return this.employees.get(id)?.role ?? null;
  }

  async list(input: { skip: number; take: number }): Promise<EmployeePage> {
    const employees = [...this.employees.values()].sort((first, second) =>
      first.name.localeCompare(second.name),
    );

    return {
      items: employees.slice(input.skip, input.skip + input.take),
      total: employees.length,
    };
  }

  async create(employee: Employee) {
    this.employees.set(employee.id, employee);
    return employee;
  }

  async update(id: string, input: EmployeeUpdate) {
    const employee = this.employees.get(id);
    if (!employee) {
      throw new Error("Employee missing from fake repository");
    }

    const updated = Employee.restore({
      ...employee.props,
      ...input,
      updatedAt: new Date(),
    });
    this.employees.set(id, updated);
    return updated;
  }

  async delete(id: string) {
    this.employees.delete(id);
  }

  seed(input: { id: string; name: string; email: string; role: string; passwordHash?: string }) {
    const now = new Date("2026-01-15T12:00:00.000Z");
    const employee = Employee.restore({
      ...input,
      passwordHash: input.passwordHash ?? "stored-password-hash",
      createdAt: now,
      updatedAt: now,
    });
    this.employees.set(employee.id, employee);
    return employee;
  }
}
