import type { AccessTokenIssuer } from "../../application/login/login.usecase";

export class JwtAccessTokenIssuer implements AccessTokenIssuer {
  constructor(private readonly signToken: (payload: { sub: string; role: string }) => string) {}

  issue(payload: { sub: string; role: string }) {
    return this.signToken(payload);
  }
}
