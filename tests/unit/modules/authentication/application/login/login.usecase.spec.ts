import { describe, expect, it, vi } from "vitest";
import {
  type AccessTokenIssuer,
  LoginUseCase,
  type PasswordVerifier,
} from "@/modules/authentication/application/login/login.usecase";
import type {
  EmployeeCredentials,
  EmployeeCredentialsRepository,
} from "@/modules/authentication/domain/employee-credentials.repository";
import { UnauthorizedError } from "@/shared/domain/errors";

class FakeEmployeeRepository implements EmployeeCredentialsRepository {
  constructor(private readonly employee: EmployeeCredentials | null) {}

  async findActiveByEmail(email: string) {
    return email === "staff@example.com" ? this.employee : null;
  }
}

describe("LoginUseCase", () => {
  it("normalizes the email and issues an access token", async () => {
    const employee = { id: "employee-1", role: "ADMIN", passwordHash: "hash" };
    const verifier: PasswordVerifier = { verify: vi.fn().mockResolvedValue(true) };
    const issuer: AccessTokenIssuer = { issue: vi.fn().mockReturnValue("signed-token") };
    const useCase = new LoginUseCase(new FakeEmployeeRepository(employee), verifier, issuer, "15m");

    await expect(
      useCase.execute({ email: " STAFF@EXAMPLE.COM ", password: "secret" }),
    ).resolves.toEqual({
      accessToken: "signed-token",
      tokenType: "Bearer",
      expiresIn: "15m",
    });
    expect(issuer.issue).toHaveBeenCalledWith({ sub: "employee-1", role: "ADMIN" });
  });

  it("rejects unknown employees without comparing passwords", async () => {
    const verifier: PasswordVerifier = { verify: vi.fn() };
    const useCase = new LoginUseCase(
      new FakeEmployeeRepository(null),
      verifier,
      { issue: () => "unused" },
      "15m",
    );

    await expect(
      useCase.execute({ email: "missing@example.com", password: "secret" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(verifier.verify).not.toHaveBeenCalled();
  });

  it("rejects incorrect passwords", async () => {
    const useCase = new LoginUseCase(
      new FakeEmployeeRepository({
        id: "employee-1",
        role: "ADMIN",
        passwordHash: "hash",
      }),
      { verify: async () => false },
      { issue: () => "unused" },
      "15m",
    );

    await expect(
      useCase.execute({ email: "staff@example.com", password: "wrong" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
