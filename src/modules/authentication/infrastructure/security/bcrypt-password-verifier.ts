import bcrypt from "bcrypt";
import type { PasswordVerifier } from "../../application/login/login.usecase";

export class BcryptPasswordVerifier implements PasswordVerifier {
  verify(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
