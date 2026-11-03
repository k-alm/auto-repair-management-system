import { AppError } from "@/shared/domain/errors/app.error";

export class QuoteNotFoundError extends AppError {
  constructor() {
    super("Orçamento não encontrado", 404, "QUOTE_NOT_FOUND");
  }
}

export class QuoteDecisionConflictError extends AppError {
  constructor(message = "O orçamento não está aguardando decisão") {
    super(message, 409, "QUOTE_DECISION_CONFLICT");
  }
}

export class InvalidQuoteAuthorizationError extends AppError {
  constructor() {
    super("Autorização inválida", 401, "INVALID_QUOTE_AUTHORIZATION");
  }
}

export class QuoteOrderConflictError extends AppError {
  constructor() {
    super("A ordem de serviço não está aguardando aprovação", 409, "QUOTE_ORDER_CONFLICT");
  }
}

export class QuoteConcurrentUpdateError extends AppError {
  constructor() {
    super("A ordem foi alterada por outra operação", 409, "QUOTE_CONCURRENT_UPDATE");
  }
}

export class QuoteNotReadyToSendError extends AppError {
  constructor() {
    super("A ordem não está pronta para envio do orçamento", 409, "QUOTE_NOT_READY_TO_SEND");
  }
}
