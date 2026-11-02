import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { CreateWorkOrderUseCase } from "../../application/create-work-order/create-work-order.usecase";
import type { GetWorkOrderUseCase } from "../../application/get-work-order/get-work-order.usecase";
import type { ListWorkOrdersUseCase } from "../../application/list-work-orders/list-work-orders.usecase";
import type { TransitionWorkOrderUseCase } from "../../application/transition-work-order/transition-work-order.usecase";
import { createWorkOrderResponseSchema } from "./schemas/create-work-order.response.schema";
import { createWorkOrderBodySchema } from "./schemas/create-work-order.schema";
import { getWorkOrderResponseSchema } from "./schemas/get-work-order.response.schema";
import { getWorkOrderParamsSchema } from "./schemas/get-work-order.schema";
import { listWorkOrdersResponseSchema } from "./schemas/list-work-orders.response.schema";
import { listWorkOrdersQuerySchema } from "./schemas/list-work-orders.schema";
import { transitionWorkOrderResponseSchema } from "./schemas/transition-work-order.response.schema";
import { transitionWorkOrderBodySchema } from "./schemas/transition-work-order.schema";

export interface WorkOrderRouteDependencies {
  create: CreateWorkOrderUseCase;
  get: GetWorkOrderUseCase;
  list: ListWorkOrdersUseCase;
  transition: TransitionWorkOrderUseCase;
}

export function workOrderRoutes(dependencies: WorkOrderRouteDependencies): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.addHook("preHandler", fastify.authenticate);

    fastify.post(
      "/api/work-orders",
      {
        schema: {
          tags: ["Work orders"],
          body: createWorkOrderBodySchema,
          response: { 201: createWorkOrderResponseSchema },
        },
      },
      async (request, reply) =>
        reply.status(201).send(await dependencies.create.execute(request.body)),
    );
    fastify.get(
      "/api/work-orders",
      {
        schema: {
          tags: ["Work orders"],
          querystring: listWorkOrdersQuerySchema,
          response: { 200: listWorkOrdersResponseSchema },
        },
      },
      async (request) => dependencies.list.execute(request.query),
    );
    fastify.get(
      "/api/work-orders/:id",
      {
        schema: {
          tags: ["Work orders"],
          params: getWorkOrderParamsSchema,
          response: { 200: getWorkOrderResponseSchema },
        },
      },
      async (request) => dependencies.get.execute(request.params),
    );
    fastify.post(
      "/api/work-orders/:id/transitions",
      {
        schema: {
          tags: ["Work orders"],
          params: getWorkOrderParamsSchema,
          body: transitionWorkOrderBodySchema,
          response: { 200: transitionWorkOrderResponseSchema },
        },
      },
      async (request) =>
        dependencies.transition.execute({
          ...request.params,
          ...request.body,
        }),
    );
  };
}
