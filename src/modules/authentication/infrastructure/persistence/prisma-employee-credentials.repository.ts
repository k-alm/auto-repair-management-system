import type { PrismaClient } from "@prisma/client";
import type {
  EmployeeCredentials,
  EmployeeCredentialsRepository,
} from "../../domain/employee-credentials.repository";

export class PrismaEmployeeCredentialsRepository implements EmployeeCredentialsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveByEmail(email: string): Promise<EmployeeCredentials | null> {
    return this.prisma.employee.findFirst({
      where: { email, deletedAt: null },
      select: { id: true, role: true, passwordHash: true },
    });
  }
}
