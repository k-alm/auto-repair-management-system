import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuoteStatus } from "@/modules/quotes/domain/quote-status";
import { WorkOrderInsufficientPartStockError } from "@/modules/work-orders/domain/work-order.errors";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";

vi.mock("@/config/env", () => ({ env: { APP_TIME_ZONE: "UTC" } }));

interface QuoteState {
  id: string;
  workOrderId: string;
  status: string;
  tokenHash: string;
  authorizationId: string;
  expiresAt: Date;
  respondedAt: Date | null;
}

interface OrderState {
  id: string;
  status: string;
}

interface MemoryState {
  quotes: Map<string, QuoteState>;
  orders: Map<string, OrderState>;
  parts: Map<string, number>;
  orderParts: Map<string, { partId: string; quantity: number }[]>;
}

function createTransactionHarness(initial: MemoryState) {
  let state = structuredClone(initial);
  let tail = Promise.resolve();

  const tx = {
    quote: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        state.quotes.get(where.id) ?? null,
      updateMany: async ({
        where,
        data,
      }: {
        where: { id: string; status: string; tokenHash?: string };
        data: { status: string; respondedAt?: Date };
      }) => {
        const quote = state.quotes.get(where.id);
        if (
          !quote ||
          quote.status !== where.status ||
          (where.tokenHash && quote.tokenHash !== where.tokenHash)
        ) {
          return { count: 0 };
        }
        quote.status = data.status;
        quote.respondedAt = data.respondedAt ?? null;
        return { count: 1 };
      },
    },
    workOrder: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        state.orders.get(where.id) ?? null,
      updateMany: async ({
        where,
        data,
      }: {
        where: { id: string; status: string };
        data: { status: string };
      }) => {
        const order = state.orders.get(where.id);
        if (!order || order.status !== where.status) return { count: 0 };
        order.status = data.status;
        return { count: 1 };
      },
    },
    workOrderPart: {
      findMany: async ({ where }: { where: { workOrderId: string } }) =>
        state.orderParts.get(where.workOrderId) ?? [],
    },
    part: {
      updateMany: async ({
        where,
        data,
      }: {
        where: { id: string; stockQuantity: { gte: number } };
        data: { stockQuantity: { decrement: number } };
      }) => {
        const stockQuantity = state.parts.get(where.id);
        if (stockQuantity === undefined || stockQuantity < where.stockQuantity.gte) {
          return { count: 0 };
        }
        state.parts.set(where.id, stockQuantity - data.stockQuantity.decrement);
        return { count: 1 };
      },
    },
  };

  const prisma = {
    $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) => {
      let release = () => {};
      const previous = tail;
      tail = new Promise<void>((resolve) => {
        release = resolve;
      });
      await previous;
      const snapshot = structuredClone(state);
      try {
        return await callback(tx);
      } catch (error) {
        state = snapshot;
        throw error;
      } finally {
        release();
      }
    },
  };

  return {
    prisma: prisma as unknown as PrismaClient,
    state: () => state,
  };
}

function quoteState(id: string, workOrderId: string): QuoteState {
  return {
    id,
    workOrderId,
    status: QuoteStatus.PENDING,
    tokenHash: `token-${id}`,
    authorizationId: `authorization-${id}`,
    expiresAt: new Date("2027-01-01T00:00:00.000Z"),
    respondedAt: null,
  };
}

function createInitialState(): MemoryState {
  return {
    quotes: new Map([["quote-1", quoteState("quote-1", "order-1")]]),
    orders: new Map([["order-1", { id: "order-1", status: WorkOrderStatus.AGUARDANDO_APROVACAO }]]),
    parts: new Map([["part-1", 1]]),
    orderParts: new Map([["order-1", [{ partId: "part-1", quantity: 1 }]]]),
  };
}

describe("PrismaQuoteRepository stock consumption", () => {
  let PrismaQuoteRepository: typeof import("@/modules/quotes/infrastructure/persistence/prisma-quote.repository").PrismaQuoteRepository;

  beforeEach(async () => {
    ({ PrismaQuoteRepository } = await import(
      "@/modules/quotes/infrastructure/persistence/prisma-quote.repository"
    ));
  });

  it("decrements stock only when approval starts execution", async () => {
    const harness = createTransactionHarness(createInitialState());
    const repository = new PrismaQuoteRepository(harness.prisma);

    await repository.decide({
      id: "quote-1",
      tokenHash: "token-quote-1",
      decision: QuoteStatus.APPROVED,
      now: new Date("2026-12-01T00:00:00.000Z"),
    });

    expect(harness.state().parts.get("part-1")).toBe(0);
    expect(harness.state().orders.get("order-1")?.status).toBe(WorkOrderStatus.EM_EXECUCAO);
    expect(harness.state().quotes.get("quote-1")?.status).toBe(QuoteStatus.APPROVED);
  });

  it("does not consume stock when the customer rejects the quote", async () => {
    const harness = createTransactionHarness(createInitialState());
    const repository = new PrismaQuoteRepository(harness.prisma);

    await repository.decide({
      id: "quote-1",
      tokenHash: "token-quote-1",
      decision: QuoteStatus.REJECTED,
      now: new Date("2026-12-01T00:00:00.000Z"),
    });

    expect(harness.state().parts.get("part-1")).toBe(1);
    expect(harness.state().orders.get("order-1")?.status).toBe(WorkOrderStatus.CANCELADA);
  });

  it("rolls back quote, order and stock changes when the balance is insufficient", async () => {
    const initial = createInitialState();
    initial.parts.set("part-2", 0);
    initial.orderParts.set("order-1", [
      { partId: "part-1", quantity: 1 },
      { partId: "part-2", quantity: 1 },
    ]);
    const harness = createTransactionHarness(initial);
    const repository = new PrismaQuoteRepository(harness.prisma);

    await expect(
      repository.decide({
        id: "quote-1",
        tokenHash: "token-quote-1",
        decision: QuoteStatus.APPROVED,
        now: new Date("2026-12-01T00:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(WorkOrderInsufficientPartStockError);

    expect(harness.state().parts.get("part-1")).toBe(1);
    expect(harness.state().parts.get("part-2")).toBe(0);
    expect(harness.state().orders.get("order-1")?.status).toBe(
      WorkOrderStatus.AGUARDANDO_APROVACAO,
    );
    expect(harness.state().quotes.get("quote-1")?.status).toBe(QuoteStatus.PENDING);
  });

  it("does not consume stock when the quote expires", async () => {
    const initial = createInitialState();
    const quote = initial.quotes.get("quote-1");
    if (!quote) throw new Error("Missing test quote");
    quote.expiresAt = new Date("2026-11-30T00:00:00.000Z");
    const harness = createTransactionHarness(initial);
    const repository = new PrismaQuoteRepository(harness.prisma);

    await expect(
      repository.decide({
        id: "quote-1",
        tokenHash: "token-quote-1",
        decision: QuoteStatus.APPROVED,
        now: new Date("2026-12-01T00:00:00.000Z"),
      }),
    ).resolves.toEqual({ expired: true });

    expect(harness.state().parts.get("part-1")).toBe(1);
    expect(harness.state().orders.get("order-1")?.status).toBe(WorkOrderStatus.CANCELADA);
    expect(harness.state().quotes.get("quote-1")?.status).toBe(QuoteStatus.EXPIRED);
  });

  it("allows only one concurrent approval to consume the final unit", async () => {
    const initial = createInitialState();
    initial.quotes.set("quote-2", quoteState("quote-2", "order-2"));
    initial.orders.set("order-2", {
      id: "order-2",
      status: WorkOrderStatus.AGUARDANDO_APROVACAO,
    });
    initial.orderParts.set("order-2", [{ partId: "part-1", quantity: 1 }]);
    const harness = createTransactionHarness(initial);
    const repository = new PrismaQuoteRepository(harness.prisma);
    const now = new Date("2026-12-01T00:00:00.000Z");

    const outcomes = await Promise.allSettled([
      repository.decide({
        id: "quote-1",
        tokenHash: "token-quote-1",
        decision: QuoteStatus.APPROVED,
        now,
      }),
      repository.decide({
        id: "quote-2",
        tokenHash: "token-quote-2",
        decision: QuoteStatus.APPROVED,
        now,
      }),
    ]);

    expect(outcomes.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect(harness.state().parts.get("part-1")).toBe(0);
  });
});
