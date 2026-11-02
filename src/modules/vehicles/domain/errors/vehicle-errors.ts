import { AppError } from "@/shared/domain/errors/app.error";

export class VehicleNotFoundError extends AppError {
  constructor() {
    super("Veículo não encontrado", 404, "VEHICLE_NOT_FOUND");
  }
}

export class VehicleAlreadyExistsError extends AppError {
  constructor() {
    super("Placa já cadastrada", 409, "VEHICLE_ALREADY_EXISTS");
  }
}

export class VehicleCustomerNotFoundError extends AppError {
  constructor() {
    super("Cliente não encontrado", 404, "CUSTOMER_NOT_FOUND");
  }
}

export class VehicleOwnerChangeNotAllowedError extends AppError {
  constructor() {
    super(
      "Não é possível alterar o proprietário após a criação de ordens de serviço",
      409,
      "VEHICLE_OWNER_CHANGE_NOT_ALLOWED",
    );
  }
}

export class VehicleHasWorkOrdersError extends AppError {
  constructor() {
    super(
      "Veículo possui ordens de serviço e não pode ser excluído",
      409,
      "VEHICLE_HAS_WORK_ORDERS",
    );
  }
}
