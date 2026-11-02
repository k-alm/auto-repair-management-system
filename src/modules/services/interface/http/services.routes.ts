import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { CreateServiceUseCase } from "../../application/create-service/create-service.usecase";
import type { DeleteServiceUseCase } from "../../application/delete-service/delete-service.usecase";
import type { GetServiceUseCase } from "../../application/get-service/get-service.usecase";
import type { ListServicesUseCase } from "../../application/list-services/list-services.usecase";
import type { UpdateServiceUseCase } from "../../application/update-service/update-service.usecase";
import { createServiceBodySchema } from "./schemas/create-service.schema";
import { deleteServiceParamsSchema } from "./schemas/delete-service.schema";
import { getServiceParamsSchema } from "./schemas/get-service.schema";
import {
  listServicesQuerySchema,
  listServicesResponseSchema,
} from "./schemas/list-services.schema";
import { serviceResponseSchema } from "./schemas/service-response.schema";
import { updateServiceBodySchema } from "./schemas/update-service.schema";

export interface ServiceRouteDependencies {
  create: CreateServiceUseCase;
  delete: DeleteServiceUseCase;
  get: GetServiceUseCase;
  list: ListServicesUseCase;
  update: UpdateServiceUseCase;
}

export function servicesRoutes(dependencies: ServiceRouteDependencies): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.addHook("preHandler", fastify.authenticate);

    fastify.post(
      "/api/services",
      {
        schema: {
          tags: ["Services"],
          body: createServiceBodySchema,
          response: { 201: serviceResponseSchema },
        },
      },
      async (request, reply) =>
        reply.status(201).send(await dependencies.create.execute(request.body)),
    );
    fastify.get(
      "/api/services",
      {
        schema: {
          tags: ["Services"],
          querystring: listServicesQuerySchema,
          response: { 200: listServicesResponseSchema },
        },
      },
      async (request) => dependencies.list.execute(request.query),
    );
    fastify.get(
      "/api/services/:id",
      {
        schema: {
          tags: ["Services"],
          params: getServiceParamsSchema,
          response: { 200: serviceResponseSchema },
        },
      },
      async (request) => dependencies.get.execute(request.params),
    );
    fastify.patch(
      "/api/services/:id",
      {
        schema: {
          tags: ["Services"],
          params: getServiceParamsSchema,
          body: updateServiceBodySchema,
          response: { 200: serviceResponseSchema },
        },
      },
      async (request) =>
        dependencies.update.execute({
          ...request.params,
          ...request.body,
        }),
    );
    fastify.delete(
      "/api/services/:id",
      { schema: { tags: ["Services"], params: deleteServiceParamsSchema } },
      async (request, reply) => {
        await dependencies.delete.execute(request.params);
        return reply.status(204).send();
      },
    );
  };
}
