import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { WorkOrderInsufficientPartStockError } from "@/modules/work-orders/domain/work-order.errors";
import { PrismaWorkOrderRepository } from "@/modules/work-orders/infrastructure/persistence/prisma-work-order.repository";

vi.mock("@/config/env", () => ({
  env: { JWT_SECRET: "test-secret-with-more-than-32-characters" },
}));

describe("PrismaWorkOrderRepository stock validation", () => {
  it("rejects requested parts above the current balance before creating the order", async () => {
    const tx = {
      customer: {
        findFirst: vi.fn().mockResolvedValue({
          id: "customer-1",
          name: "Cliente",
          email: "customer@example.com",
        }),
      },
      vehicle: {
        findFirst: vi.fn().mockResolvedValue({ id: "vehicle-1" }),
      },
      service: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      part: {
        findMany: vi
          .fn()
          .mockResolvedValue([
            { id: "part-1", price: { toString: () => "12.00" }, stockQuantity: 1 },
          ]),
      },
      workOrder: {
        create: vi.fn(),
      },
    };
    const prisma = {
      $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) => callback(tx),
    };
    const repository = new PrismaWorkOrderRepository(prisma as unknown as PrismaClient);

    await expect(
      repository.create({
        customerDocument: "52998224725",
        vehicleId: "vehicle-1",
        serviceIds: [],
        parts: [{ partId: "part-1", quantity: 2 }],
        trackingTokenHash: "tracking-hash",
        trackingToken: "tracking-token",
        trackingTokenExpiresAt: new Date("2027-01-01T00:00:00.000Z"),
        publicApiUrl: "https://api.example.com",
      }),
    ).rejects.toBeInstanceOf(WorkOrderInsufficientPartStockError);

    expect(tx.workOrder.create).not.toHaveBeenCalled();
  });
});
