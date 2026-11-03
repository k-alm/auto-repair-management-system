import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { CreateCustomerUseCase } from "../../application/create-customer/create-customer.usecase";
import type { DeleteCustomerUseCase } from "../../application/delete-customer/delete-customer.usecase";
import type { GetCustomerUseCase } from "../../application/get-customer/get-customer.usecase";
import type { ListCustomersUseCase } from "../../application/list-customers/list-customers.usecase";
import type { UpdateCustomerUseCase } from "../../application/update-customer/update-customer.usecase";
import { createCustomerBodySchema } from "./schemas/create-customer.schema";
import { customerParamsSchema } from "./schemas/customer-params.schema";
import {
  createdCustomerResponseSchema,
  customerDetailResponseSchema,
} from "./schemas/customer-response.schema";
import { listCustomersQuerySchema } from "./schemas/list-customers.schema";
import { updateCustomerBodySchema } from "./schemas/update-customer.schema";

export interface CustomerRouteDependencies {
  createCustomer: CreateCustomerUseCase;
  deleteCustomer: DeleteCustomerUseCase;
  getCustomer: GetCustomerUseCase;
  listCustomers: ListCustomersUseCase;
  updateCustomer: UpdateCustomerUseCase;
}

export function customerRoutes(dependencies: CustomerRouteDependencies): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.addHook("preHandler", fastify.authenticate);

    fastify.post(
      "/api/customers",
      {
        schema: {
          tags: ["Customers"],
          body: createCustomerBodySchema,
          response: { 201: createdCustomerResponseSchema },
        },
      },
      async (request, reply) => {
        const customer = await dependencies.createCustomer.execute(request.body);
        return reply.status(201).send(customer);
      },
    );

    fastify.get(
      "/api/customers",
      {
        schema: { tags: ["Customers"], querystring: listCustomersQuerySchema },
      },
      async (request) => dependencies.listCustomers.execute(request.query),
    );

    fastify.get(
      "/api/customers/:id",
      {
        schema: {
          tags: ["Customers"],
          params: customerParamsSchema,
          response: { 200: customerDetailResponseSchema },
        },
      },
      async (request) => dependencies.getCustomer.execute(request.params),
    );

    fastify.patch(
      "/api/customers/:id",
      {
        schema: {
          tags: ["Customers"],
          params: customerParamsSchema,
          body: updateCustomerBodySchema,
        },
      },
      async (request) =>
        dependencies.updateCustomer.execute({
          ...request.params,
          ...request.body,
        }),
    );

    fastify.delete(
      "/api/customers/:id",
      {
        schema: {
          tags: ["Customers"],
          params: customerParamsSchema,
        },
      },
      async (request, reply) => {
        await dependencies.deleteCustomer.execute(request.params);
        return reply.status(204).send();
      },
    );
  };
}
