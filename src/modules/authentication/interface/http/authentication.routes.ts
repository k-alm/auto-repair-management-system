import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { LoginUseCase } from "../../application/login/login.usecase";
import { loginBodySchema, loginResponseSchema } from "./schemas/login.schema";

export function authenticationRoutes(login: LoginUseCase): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.post(
      "/api/auth/login",
      {
        schema: {
          tags: ["Auth"],
          summary: "Autentica um funcionário",
          security: [],
          body: loginBodySchema,
          response: { 200: loginResponseSchema },
        },
        config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      },
      async (request) => login.execute(request.body),
    );
  };
}
