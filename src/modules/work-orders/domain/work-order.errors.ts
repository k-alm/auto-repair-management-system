import { AppError } from "@/shared/domain/errors/app.error";

export class WorkOrderNotFoundError extends AppError {
  constructor() {
    super("Ordem de serviço não encontrada", 404, "WORK_ORDER_NOT_FOUND");
  }
}

export class WorkOrderCustomerNotFoundError extends AppError {
  constructor() {
    super("Cliente não encontrado", 404, "CUSTOMER_NOT_FOUND");
  }
}

export class WorkOrderVehicleOwnershipError extends AppError {
  constructor() {
    super("Veículo não pertence ao cliente informado", 422, "WORK_ORDER_VEHICLE_OWNERSHIP");
  }
}

export class WorkOrderCatalogItemUnavailableError extends AppError {
  constructor(item: "Serviço" | "Peça") {
    super(`${item} inexistente ou inativo`, 422, "WORK_ORDER_CATALOG_ITEM_UNAVAILABLE");
  }
}

export class WorkOrderDuplicateItemsError extends AppError {
  constructor(item: "Serviços" | "Peças") {
    super(`${item} duplicados não são permitidos`, 422, "WORK_ORDER_DUPLICATE_ITEMS");
  }
}

export class WorkOrderInvalidPartQuantityError extends AppError {
  constructor() {
    super("A quantidade de peças deve ser maior que zero", 422, "WORK_ORDER_INVALID_PART_QUANTITY");
  }
}

export class WorkOrderInsufficientPartStockError extends AppError {
  constructor() {
    super("Estoque insuficiente para as peças da ordem de serviço", 409, "INSUFFICIENT_PART_STOCK");
  }
}

export class WorkOrderConcurrentUpdateError extends AppError {
  constructor() {
    super("A ordem foi alterada por outra operação", 409, "WORK_ORDER_CONCURRENT_UPDATE");
  }
}
