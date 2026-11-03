import type { PrismaClient } from "@prisma/client";
import type {
  EmployeePage,
  EmployeeRepository,
  EmployeeUpdate,
} from "../../domain/employee.repository";
import { Employee } from "../../domain/entities/employee";

function toDomain(record: {
  id: string;
  name: string;
  email: string;
  role: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return Employee.restore({
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async existsByEmail(email: string, exceptId?: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        email,
        ...(exceptId && { id: { not: exceptId } }),
      },
      select: { id: true },
    });

    return employee !== null;
  }

  async findById(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    return employee ? toDomain(employee) : null;
  }

  async findRoleById(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      select: { role: true },
    });

    return employee?.role ?? null;
  }

  async list(input: { skip: number; take: number }): Promise<EmployeePage> {
    const where = { deletedAt: null };
    const [employees, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        orderBy: { name: "asc" },
        skip: input.skip,
        take: input.take,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      items: employees.map(toDomain),
      total,
    };
  }

  async create(employee: Employee) {
    const record = await this.prisma.employee.create({
      data: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        passwordHash: employee.passwordHash,
      },
    });

    return toDomain(record);
  }

  async update(id: string, input: EmployeeUpdate) {
    const record = await this.prisma.employee.update({
      where: { id },
      data: input,
    });

    return toDomain(record);
  }

  async delete(id: string) {
    await this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
