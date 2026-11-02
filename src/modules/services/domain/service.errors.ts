import { AppError } from "@/shared/domain/errors/app.error";

export class ServiceNotFoundError extends AppError {
  constructor() {
    super("Serviço não encontrado", 404, "CATALOG_ITEM_NOT_FOUND");
  }
}

export class InvalidServicePriceError extends AppError {
  constructor() {
    super("O preço não pode ser negativo", 422, "INVALID_CATALOG_PRICE");
  }
}
