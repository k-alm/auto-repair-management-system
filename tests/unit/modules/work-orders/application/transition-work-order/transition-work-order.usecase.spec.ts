import { FakeWorkOrderRepository } from "@tests/support/fake-work-order.repository";
import { describe, expect, it } from "vitest";
import { TransitionWorkOrderUseCase } from "@/modules/work-orders/application/transition-work-order/transition-work-order.usecase";
import { WorkOrderNotFoundError } from "@/modules/work-orders/domain/work-order.errors";
import { ConflictError } from "@/shared/domain/errors";

describe("TransitionWorkOrderUseCase", () => {
  it("requires an existing order before a transition", async () => {
    await expect(
      new TransitionWorkOrderUseCase(new FakeWorkOrderRepository()).execute({
        id: "missing",
        to: "EM_DIAGNOSTICO",
      }),
    ).rejects.toBeInstanceOf(WorkOrderNotFoundError);
  });

  it("rejects a transition that is not supported by the workflow", async () => {
    const repository = new FakeWorkOrderRepository();
    repository.details = {
      id: "order-id",
      status: "RECEBIDA",
      createdAt: new Date(),
      startedAt: null,
      finishedAt: null,
      customer: {
        id: "customer-id",
        name: "Ana",
        document: "52998224725",
        email: "a@b.co",
        phone: "11999999999",
      },
      vehicle: { id: "vehicle-id", plate: "ABC1234", brand: "Marca", model: "Modelo", year: 2020 },
      services: [],
      parts: [],
      quote: null,
    };
    await expect(
      new TransitionWorkOrderUseCase(repository).execute({ id: "order-id", to: "FINALIZADA" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("transitions an order according to the state machine", async () => {
    const repository = new FakeWorkOrderRepository();
    repository.details = {
      id: "order-id",
      status: "RECEBIDA",
      createdAt: new Date(),
      startedAt: null,
      finishedAt: null,
      customer: {
        id: "customer-id",
        name: "Ana",
        document: "52998224725",
        email: "a@b.co",
        phone: "11999999999",
      },
      vehicle: { id: "vehicle-id", plate: "ABC1234", brand: "Marca", model: "Modelo", year: 2020 },
      services: [],
      parts: [],
      quote: null,
    };
    await expect(
      new TransitionWorkOrderUseCase(repository).execute({ id: "order-id", to: "EM_DIAGNOSTICO" }),
    ).resolves.toMatchObject({ id: "order-id", status: "EM_DIAGNOSTICO" });
  });
});
