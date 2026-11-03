import { AppError } from "@/shared/domain/errors/app.error";

export class EmployeeAlreadyExistsError extends AppError {
  constructor() {
    super("E-mail já cadastrado", 409, "EMPLOYEE_ALREADY_EXISTS");
  }
}

export class EmployeeNotFoundError extends AppError {
  constructor() {
    super("Funcionário não encontrado", 404, "EMPLOYEE_NOT_FOUND");
  }
}

export class InvalidEmployeeRoleError extends AppError {
  constructor() {
    super("Cargo de funcionário inválido", 422, "INVALID_EMPLOYEE_ROLE");
  }
}

export class EmployeeSelfRoleChangeForbiddenError extends AppError {
  constructor() {
    super("Não é permitido alterar o próprio cargo", 403, "EMPLOYEE_SELF_ROLE_CHANGE_FORBIDDEN");
  }
}
