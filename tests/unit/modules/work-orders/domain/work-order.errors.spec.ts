import { describe, expect, it } from "vitest";
import {
  WorkOrderCatalogItemUnavailableError,
  WorkOrderConcurrentUpdateError,
  WorkOrderCustomerNotFoundError,
  WorkOrderDuplicateItemsError,
  WorkOrderInvalidPartQuantityError,
  WorkOrderNotFoundError,
  WorkOrderVehicleOwnershipError,
} from "@/modules/work-orders/domain/work-order.errors";

describe("work order errors", () => {
  it.each([
    [new WorkOrderNotFoundError(), 404, "WORK_ORDER_NOT_FOUND", "Ordem de serviço não encontrada"],
    [new WorkOrderCustomerNotFoundError(), 404, "CUSTOMER_NOT_FOUND", "Cliente não encontrado"],
    [
      new WorkOrderVehicleOwnershipError(),
      422,
      "WORK_ORDER_VEHICLE_OWNERSHIP",
      "Veículo não pertence ao cliente informado",
    ],
    [
      new WorkOrderInvalidPartQuantityError(),
      422,
      "WORK_ORDER_INVALID_PART_QUANTITY",
      "A quantidade de peças deve ser maior que zero",
    ],
    [
      new WorkOrderConcurrentUpdateError(),
      409,
      "WORK_ORDER_CONCURRENT_UPDATE",
      "A ordem foi alterada por outra operação",
    ],
  ])("exposes the expected properties for %s", (error, statusCode, code, message) => {
    expect(error.statusCode).toBe(statusCode);
    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
    expect(error.name).toBe(error.constructor.name);
  });

  it.each([
    ["Serviço", "Serviço inexistente ou inativo"],
    ["Peça", "Peça inexistente ou inativo"],
  ] as const)("describes an unavailable %s", (item, message) => {
    const error = new WorkOrderCatalogItemUnavailableError(item);

    expect(error.statusCode).toBe(422);
    expect(error.code).toBe("WORK_ORDER_CATALOG_ITEM_UNAVAILABLE");
    expect(error.message).toBe(message);
  });

  it.each([
    ["Serviços", "Serviços duplicados não são permitidos"],
    ["Peças", "Peças duplicados não são permitidos"],
  ] as const)("describes duplicate %s", (item, message) => {
    const error = new WorkOrderDuplicateItemsError(item);

    expect(error.statusCode).toBe(422);
    expect(error.code).toBe("WORK_ORDER_DUPLICATE_ITEMS");
    expect(error.message).toBe(message);
  });
});
