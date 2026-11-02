import jwt from "@fastify/jwt";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { env } from "@/config/env";
import { UnauthorizedError } from "@/shared/domain/errors";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; role: string };
    user: { sub: string; role: string };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

import type { FastifyRequest } from "fastify";

const authPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  fastify.decorate("authenticate", async (request: FastifyRequest) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new UnauthorizedError("Token de acesso inválido ou expirado");
    }
    const employee = await fastify.prisma.employee.findFirst({
      where: { id: request.user.sub, deletedAt: null },
      select: { id: true },
    });
    if (!employee) throw new UnauthorizedError("Funcionário não autorizado");
  });
};

export default fp(authPlugin, { name: "auth" });
