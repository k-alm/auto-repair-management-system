import type { PrismaClient } from "@prisma/client";
import { Vehicle } from "../../domain/entities/vehicle";
import { VehiclePlate } from "../../domain/value-objects/vehicle-plate";
import type {
  VehiclePage,
  VehicleRepository,
  VehicleUpdate,
} from "../../domain/vehicle.repository";

function toDomain(record: {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
}) {
  return Vehicle.restore({
    ...record,
    plate: VehiclePlate.create(record.plate),
  });
}

export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async customerExists(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    return customer !== null;
  }

  async existsByPlate(plate: string) {
    return (
      (await this.prisma.vehicle.findFirst({
        where: { plate },
        select: { id: true },
      })) !== null
    );
  }

  async findById(id: string) {
    const record = await this.prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? toDomain(record) : null;
  }

  async list(input: { skip: number; take: number; customerId?: string }): Promise<VehiclePage> {
    const where = {
      deletedAt: null,
      ...(input.customerId && { customerId: input.customerId }),
    };
    const [records, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        orderBy: { plate: "asc" },
        skip: input.skip,
        take: input.take,
      }),
      this.prisma.vehicle.count({ where }),
    ]);
    return { items: records.map(toDomain), total };
  }

  async create(vehicle: Vehicle) {
    const record = await this.prisma.vehicle.create({
      data: {
        id: vehicle.id,
        customerId: vehicle.customerId,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
      },
    });
    return toDomain(record);
  }

  async update(id: string, input: VehicleUpdate) {
    const record = await this.prisma.vehicle.update({ where: { id }, data: input });
    return toDomain(record);
  }

  async hasWorkOrders(id: string) {
    return (await this.prisma.workOrder.count({ where: { vehicleId: id } })) > 0;
  }

  async delete(id: string) {
    await this.prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
