import type { PrismaClient } from "@prisma/client";
import type { TrackedWorkOrder, TrackingRepository } from "../../domain/tracking.repository";

export class PrismaTrackingRepository implements TrackingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAuthorized(input: {
    id: string;
    tokenHash: string;
    now: Date;
  }): Promise<TrackedWorkOrder | null> {
    const order = await this.prisma.workOrder.findFirst({
      where: {
        id: input.id,
        trackingTokenHash: input.tokenHash,
        trackingTokenExpiresAt: { gt: input.now },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        startedAt: true,
        finishedAt: true,
        vehicle: { select: { plate: true, brand: true, model: true, year: true } },
        services: { select: { service: { select: { name: true } } } },
      },
    });
    if (!order) return null;
    return {
      id: order.id,
      status: order.status,
      openedAt: order.createdAt,
      vehicle: order.vehicle,
      services: order.services.map(({ service }) => service.name),
      startedAt: order.startedAt,
      finishedAt: order.finishedAt,
    };
  }
}
