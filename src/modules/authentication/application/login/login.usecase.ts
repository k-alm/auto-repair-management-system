import { UnauthorizedError } from "@/shared/domain/errors";
import type { EmployeeCredentialsRepository } from "../../domain/employee-credentials.repository";
import type { LoginInput } from "./login.input";
import type { LoginResponse } from "./login.response";

export interface PasswordVerifier {
  verify(password: string, hash: string): Promise<boolean>;
}

export interface AccessTokenIssuer {
  issue(payload: { sub: string; role: string }): string;
}

export class LoginUseCase {
  constructor(
    private readonly employees: EmployeeCredentialsRepository,
    private readonly passwords: PasswordVerifier,
    private readonly tokens: AccessTokenIssuer,
    private readonly expiresIn: string,
  ) {}

  async execute(input: LoginInput): Promise<LoginResponse> {
    const employee = await this.employees.findActiveByEmail(input.email.trim().toLowerCase());
    if (!employee || !(await this.passwords.verify(input.password, employee.passwordHash))) {
      throw new UnauthorizedError("E-mail ou senha inválidos");
    }

    return {
      accessToken: this.tokens.issue({ sub: employee.id, role: employee.role }),
      tokenType: "Bearer",
      expiresIn: this.expiresIn,
    };
  }
}
