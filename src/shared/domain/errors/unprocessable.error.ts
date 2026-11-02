import { AppError } from "./app.error";

export class UnprocessableError extends AppError {
  constructor(message = "Unprocessable entity") {
    super(message, 422, "UNPROCESSABLE");
  }
}
