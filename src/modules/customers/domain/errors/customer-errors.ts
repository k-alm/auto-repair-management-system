import { AppError } from "@/shared/domain/errors/app.error";

export class InvalidCustomerDocumentError extends AppError {
  constructor() {
    super("CPF ou CNPJ inválido", 422, "INVALID_CUSTOMER_DOCUMENT");
  }
}

export class CustomerAlreadyExistsError extends AppError {
  constructor() {
    super("Documento já cadastrado", 409, "CUSTOMER_ALREADY_EXISTS");
  }
}

export class CustomerNotFoundError extends AppError {
  constructor() {
    super("Cliente não encontrado", 404, "CUSTOMER_NOT_FOUND");
  }
}

export class CustomerHasRelationsError extends AppError {
  constructor() {
    super(
      "Cliente possui veículos ou ordens de serviço e não pode ser excluído",
      409,
      "CUSTOMER_HAS_RELATIONS",
    );
  }
}
