import type { PrismaClient } from "@prisma/client";
import type { Service, ServiceProps } from "../../domain/entities/service";
import { Service as ServiceEntity } from "../../domain/entities/service";
import type { ServicePage, ServiceRepository } from "../../domain/service.repository";

export class PrismaServiceRepository implements ServiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createService(service: Service) {
    const record = await this.prisma.service.create({
      data: { ...service.props },
    });

    return this.restore(record);
  }

  async findService(id: string) {
    const record = await this.prisma.service.findFirst({ where: { id, deletedAt: null } });

    return record ? this.restore(record) : null;
  }

  async listServices(input: { skip: number; take: number }): Promise<ServicePage> {
    const where = { deletedAt: null };
    const [records, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        orderBy: { name: "asc" },
        skip: input.skip,
        take: input.take,
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      items: records.map((record) => this.restore(record)),
      total,
    };
  }

  async updateService(id: string, input: Partial<Omit<ServiceProps, "id">>) {
    const record = await this.prisma.service.update({
      where: { id },
      data: input,
    });

    return this.restore(record);
  }

  async deleteService(id: string, preserveUsage: boolean) {
    if (preserveUsage) {
      await this.prisma.service.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
      return;
    }

    await this.prisma.service.delete({ where: { id } });
  }

  async existsServiceUsage(id: string) {
    return (await this.prisma.workOrderService.count({ where: { serviceId: id } })) > 0;
  }

  private restore(record: {
    id: string;
    name: string;
    description: string | null;
    price: { toString(): string };
    estimatedMinutes: number;
    isActive: boolean;
  }) {
    return ServiceEntity.restore({
      id: record.id,
      name: record.name,
      description: record.description,
      price: record.price.toString(),
      estimatedMinutes: record.estimatedMinutes,
      isActive: record.isActive,
    });
  }
}
