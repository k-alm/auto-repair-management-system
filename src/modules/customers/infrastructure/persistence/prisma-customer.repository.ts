import type { PrismaClient } from "@prisma/client";
import type {
  CustomerPage,
  CustomerRepository,
  CustomerUpdate,
} from "../../domain/customer.repository";
import { Customer } from "../../domain/entities/customer";
import { CustomerDocument } from "../../domain/value-objects/customer-document";

function toDomain(record: {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return Customer.restore({
    ...record,
    document: CustomerDocument.create(record.document),
  });
}

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async existsByDocument(document: string) {
    const existing = await this.prisma.customer.findFirst({
      where: { document },
      select: { id: true },
    });
    return existing !== null;
  }

  async findById(id: string) {
    const record = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? toDomain(record) : null;
  }

  async list(input: { skip: number; take: number }): Promise<CustomerPage> {
    const where = { deletedAt: null };
    const [records, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy: { name: "asc" },
        skip: input.skip,
        take: input.take,
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { items: records.map(toDomain), total };
  }

  async create(customer: Customer) {
    const record = await this.prisma.customer.create({
      data: {
        id: customer.id,
        name: customer.name,
        document: customer.document,
        email: customer.email,
        phone: customer.phone,
      },
    });
    return toDomain(record);
  }

  async update(id: string, input: CustomerUpdate) {
    const record = await this.prisma.customer.update({
      where: { id },
      data: input,
    });
    return toDomain(record);
  }

  async hasRelations(id: string) {
    const [vehicles, orders] = await this.prisma.$transaction([
      this.prisma.vehicle.count({ where: { customerId: id } }),
      this.prisma.workOrder.count({ where: { customerId: id } }),
    ]);
    return vehicles > 0 || orders > 0;
  }

  async delete(id: string) {
    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
