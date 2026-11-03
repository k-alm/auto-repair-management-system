import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { AddPartStockUseCase } from "../../application/add-part-stock/add-part-stock.usecase";
import type { CreatePartUseCase } from "../../application/create-part/create-part.usecase";
import type { DeletePartUseCase } from "../../application/delete-part/delete-part.usecase";
import type { GetPartUseCase } from "../../application/get-part/get-part.usecase";
import type { ListPartsUseCase } from "../../application/list-parts/list-parts.usecase";
import type { SetPartStockUseCase } from "../../application/set-part-stock/set-part-stock.usecase";
import type { UpdatePartUseCase } from "../../application/update-part/update-part.usecase";
import { addPartStockBodySchema } from "./schemas/add-part-stock.schema";
import { createPartBodySchema } from "./schemas/create-part.schema";
import { deletePartParamsSchema } from "./schemas/delete-part.schema";
import { getPartParamsSchema } from "./schemas/get-part.schema";
import { listPartsQuerySchema, listPartsResponseSchema } from "./schemas/list-parts.schema";
import { partResponseSchema } from "./schemas/part-response.schema";
import { setPartStockBodySchema } from "./schemas/set-part-stock.schema";
import { updatePartBodySchema } from "./schemas/update-part.schema";

export interface PartRouteDependencies {
  create: CreatePartUseCase;
  addStock: AddPartStockUseCase;
  delete: DeletePartUseCase;
  get: GetPartUseCase;
  list: ListPartsUseCase;
  setStock: SetPartStockUseCase;
  update: UpdatePartUseCase;
}

export function partsRoutes(dependencies: PartRouteDependencies): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.addHook("preHandler", fastify.authenticate);

    fastify.post(
      "/api/parts",
      {
        schema: {
          tags: ["Parts"],
          body: createPartBodySchema,
          response: { 201: partResponseSchema },
        },
      },
      async (request, reply) =>
        reply.status(201).send(await dependencies.create.execute(request.body)),
    );
    fastify.get(
      "/api/parts",
      {
        schema: {
          tags: ["Parts"],
          querystring: listPartsQuerySchema,
          response: { 200: listPartsResponseSchema },
        },
      },
      async (request) => dependencies.list.execute(request.query),
    );
    fastify.patch(
      "/api/parts/:id/stock",
      {
        schema: {
          tags: ["Parts"],
          params: getPartParamsSchema,
          body: setPartStockBodySchema,
          response: { 200: partResponseSchema },
        },
      },
      async (request) =>
        dependencies.setStock.execute({
          ...request.params,
          ...request.body,
        }),
    );
    fastify.post(
      "/api/parts/:id/stock/entries",
      {
        schema: {
          tags: ["Parts"],
          params: getPartParamsSchema,
          body: addPartStockBodySchema,
          response: { 200: partResponseSchema },
        },
      },
      async (request) =>
        dependencies.addStock.execute({
          ...request.params,
          ...request.body,
        }),
    );
    fastify.get(
      "/api/parts/:id",
      {
        schema: {
          tags: ["Parts"],
          params: getPartParamsSchema,
          response: { 200: partResponseSchema },
        },
      },
      async (request) => dependencies.get.execute(request.params),
    );
    fastify.patch(
      "/api/parts/:id",
      {
        schema: {
          tags: ["Parts"],
          params: getPartParamsSchema,
          body: updatePartBodySchema,
          response: { 200: partResponseSchema },
        },
      },
      async (request) =>
        dependencies.update.execute({
          ...request.params,
          ...request.body,
        }),
    );
    fastify.delete(
      "/api/parts/:id",
      { schema: { tags: ["Parts"], params: deletePartParamsSchema } },
      async (request, reply) => {
        await dependencies.delete.execute(request.params);
        return reply.status(204).send();
      },
    );
  };
}
