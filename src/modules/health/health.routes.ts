import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { healthSchema } from "./health.schemas";

const healthRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get("/health", { schema: healthSchema }, async (_, reply) => {
    try {
      return {
        status: "ok" as const,
        timestamp: new Date().toISOString(),
        database: "ok" as const,
      };
    } catch {
      return reply.status(503).send({
        status: "error" as const,
        timestamp: new Date().toISOString(),
        database: "unreachable" as const,
      });
    }
  });
};

export default healthRoutes;
