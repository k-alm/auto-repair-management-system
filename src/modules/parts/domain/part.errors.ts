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

export class InvalidPartStockQuantityError extends AppError {
  constructor() {
    super("A quantidade em estoque deve ser um inteiro não negativo", 422, "INVALID_PART_STOCK");
  }
}

export class InvalidPartStockEntryError extends AppError {
  constructor() {
    super(
      "A quantidade recebida deve ser um inteiro maior que zero",
      422,
      "INVALID_PART_STOCK_ENTRY",
    );
  }
}

export class PartStockOverflowError extends AppError {
  constructor() {
    super("A quantidade excede o limite de estoque permitido", 409, "PART_STOCK_OVERFLOW");
  }
}
