import bcrypt from "bcrypt";
import type { PasswordHasher } from "../../application/create-employee/create-employee.usecase";

export class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string) {
    return bcrypt.hash(password, 12);
  }
}
