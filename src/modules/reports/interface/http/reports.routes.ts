import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { GetAverageExecutionTimeUseCase } from "../../application/get-average-execution-time/get-average-execution-time.usecase";
import { averageExecutionTimeResponseSchema } from "./schemas/average-execution-time.schema";

export function reportRoutes(useCase: GetAverageExecutionTimeUseCase): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.get(
      "/api/reports/average-execution-time",
      {
        schema: {
          tags: ["Reports"],
          summary: "Tempo médio entre o início e a finalização das ordens concluídas",
          security: [{ bearerAuth: [] }],
          response: { 200: averageExecutionTimeResponseSchema },
        },
        preHandler: fastify.authenticate,
      },
      async () => useCase.execute({}),
    );
  };
}
