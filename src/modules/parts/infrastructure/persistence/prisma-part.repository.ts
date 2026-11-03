import type { PrismaClient } from "@prisma/client";
import type { Part, PartProps } from "../../domain/entities/part";
import { MAX_PART_STOCK_QUANTITY, Part as PartEntity } from "../../domain/entities/part";
import { PartNotFoundError, PartStockOverflowError } from "../../domain/part.errors";
import type { PartPage, PartRepository } from "../../domain/part.repository";

export class PrismaPartRepository implements PartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPart(part: Part) {
    const record = await this.prisma.part.create({
      data: { ...part.props, price: part.props.price },
    });

    return this.restore(record);
  }

  async findPart(id: string) {
    const record = await this.prisma.part.findFirst({ where: { id, deletedAt: null } });

    return record ? this.restore(record) : null;
  }

  async listParts(input: { skip: number; take: number }): Promise<PartPage> {
    const where = { deletedAt: null };
    const [records, total] = await this.prisma.$transaction([
      this.prisma.part.findMany({
        where,
        orderBy: { name: "asc" },
        skip: input.skip,
        take: input.take,
      }),
      this.prisma.part.count({ where }),
    ]);

    return {
      items: records.map((record) => this.restore(record)),
      total,
    };
  }

  async updatePart(id: string, input: Partial<Omit<PartProps, "id">>) {
    const record = await this.prisma.part.update({ where: { id }, data: input });

    return this.restore(record);
  }

  async setPartStockQuantity(id: string, stockQuantity: number) {
    const updated = await this.prisma.part.updateMany({
      where: { id, deletedAt: null },
      data: { stockQuantity },
    });
    if (updated.count !== 1) throw new PartNotFoundError();

    const record = await this.prisma.part.findUniqueOrThrow({ where: { id } });

    return this.restore(record);
  }

  async addPartStock(id: string, quantity: number) {
    const updated = await this.prisma.part.updateMany({
      where: {
        id,
        deletedAt: null,
        stockQuantity: { lte: MAX_PART_STOCK_QUANTITY - quantity },
      },
      data: { stockQuantity: { increment: quantity } },
    });
    if (updated.count !== 1) {
      const current = await this.findPart(id);
      if (!current) throw new PartNotFoundError();
      throw new PartStockOverflowError();
    }

    const record = await this.prisma.part.findUniqueOrThrow({ where: { id } });

    return this.restore(record);
  }

  async deletePart(id: string, preserveUsage: boolean) {
    if (preserveUsage) {
      await this.prisma.part.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
      return;
    }

    await this.prisma.part.delete({ where: { id } });
  }

  async existsPartUsage(id: string) {
    return (await this.prisma.workOrderPart.count({ where: { partId: id } })) > 0;
  }

  async existsSku(sku: string, exceptId?: string) {
    return (
      (await this.prisma.part.findFirst({
        where: { sku, ...(exceptId && { id: { not: exceptId } }) },
        select: { id: true },
      })) !== null
    );
  }

  private restore(record: {
    id: string;
    name: string;
    description: string | null;
    sku: string;
    price: { toString(): string };
    isActive: boolean;
    stockQuantity: number;
  }) {
    return PartEntity.restore({
      id: record.id,
      name: record.name,
      description: record.description,
      sku: record.sku,
      price: record.price.toString(),
      isActive: record.isActive,
      stockQuantity: record.stockQuantity,
    });
  }
}
