import type { FastifyInstance } from "fastify";
import healthRoutes from "@/modules/health/health.routes";

export const routes = async (fastify: FastifyInstance) => {
  await fastify.register(healthRoutes);
};
