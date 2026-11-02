import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { CreateVehicleUseCase } from "../../application/create-vehicle/create-vehicle.usecase";
import type { DeleteVehicleUseCase } from "../../application/delete-vehicle/delete-vehicle.usecase";
import type { GetVehicleUseCase } from "../../application/get-vehicle/get-vehicle.usecase";
import type { ListVehiclesUseCase } from "../../application/list-vehicles/list-vehicles.usecase";
import type { UpdateVehicleUseCase } from "../../application/update-vehicle/update-vehicle.usecase";
import { createVehicleBodySchema } from "./schemas/create-vehicle.schema";
import { listVehiclesQuerySchema } from "./schemas/list-vehicles.schema";
import { updateVehicleBodySchema } from "./schemas/update-vehicle.schema";
import { vehicleParamsSchema } from "./schemas/vehicle-params.schema";

export interface VehicleRouteDependencies {
  createVehicle: CreateVehicleUseCase;
  deleteVehicle: DeleteVehicleUseCase;
  getVehicle: GetVehicleUseCase;
  listVehicles: ListVehiclesUseCase;
  updateVehicle: UpdateVehicleUseCase;
}

export function vehicleRoutes(dependencies: VehicleRouteDependencies): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.addHook("preHandler", fastify.authenticate);

    fastify.post(
      "/api/vehicles",
      { schema: { tags: ["Vehicles"], body: createVehicleBodySchema } },
      async (request, reply) =>
        reply.status(201).send(await dependencies.createVehicle.execute(request.body)),
    );

    fastify.get(
      "/api/vehicles",
      { schema: { tags: ["Vehicles"], querystring: listVehiclesQuerySchema } },
      async (request) => dependencies.listVehicles.execute(request.query),
    );

    fastify.get(
      "/api/vehicles/:id",
      { schema: { tags: ["Vehicles"], params: vehicleParamsSchema } },
      async (request) => dependencies.getVehicle.execute(request.params),
    );

    fastify.patch(
      "/api/vehicles/:id",
      {
        schema: {
          tags: ["Vehicles"],
          params: vehicleParamsSchema,
          body: updateVehicleBodySchema,
        },
      },
      async (request) =>
        dependencies.updateVehicle.execute({
          ...request.params,
          ...request.body,
        }),
    );

    fastify.delete(
      "/api/vehicles/:id",
      { schema: { tags: ["Vehicles"], params: vehicleParamsSchema } },
      async (request, reply) => {
        await dependencies.deleteVehicle.execute(request.params);
        return reply.status(204).send();
      },
    );
  };
}
