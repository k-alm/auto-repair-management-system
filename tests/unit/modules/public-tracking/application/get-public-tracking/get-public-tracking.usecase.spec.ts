import { FakeTrackingRepository } from "@tests/support/fake-tracking.repository";
import { describe, expect, it } from "vitest";
import { GetPublicTrackingUseCase } from "@/modules/public-tracking/application/get-public-tracking/get-public-tracking.usecase";
import { WorkOrderStatus } from "@/modules/work-orders/domain/work-order-status";
import { UnauthorizedError } from "@/shared/domain/errors";

describe("GetPublicTrackingUseCase", () => {
  it("validates the tracking credential and returns public fields", async () => {
    const repository = new FakeTrackingRepository();
    repository.trackedOrder = {
      id: "order-id",
      status: WorkOrderStatus.EM_EXECUCAO,
      openedAt: new Date(),
      vehicle: { plate: "ABC1234", brand: "Marca", model: "Modelo", year: 2020 },
      services: ["Revisão"],
      startedAt: new Date(),
      finishedAt: null,
    };
    const result = await new GetPublicTrackingUseCase(repository, {
      hash: (token) => `hash:${token}`,
    }).execute({ id: "order-id", token: "secret-token" });

    expect(repository.authorization).toMatchObject({
      id: "order-id",
      tokenHash: "hash:secret-token",
    });
    expect(result.services).toEqual(["Revisão"]);
  });

  it("rejects invalid or expired tracking tokens", async () => {
    await expect(
      new GetPublicTrackingUseCase(new FakeTrackingRepository(), {
        hash: (token) => token,
      }).execute({ id: "order-id", token: "invalid-token" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
