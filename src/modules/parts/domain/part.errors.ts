import { AppError } from "@/shared/domain/errors/app.error";

export class PartNotFoundError extends AppError {
  constructor() {
    super("Peça não encontrada", 404, "CATALOG_ITEM_NOT_FOUND");
  }
}

export class DuplicatePartSkuError extends AppError {
  constructor() {
    super("SKU já cadastrado", 409, "CATALOG_DUPLICATE_SKU");
  }
}

export class InvalidPartPriceError extends AppError {
  constructor() {
    super("O preço não pode ser negativo", 422, "INVALID_CATALOG_PRICE");
  }
}
