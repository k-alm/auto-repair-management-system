import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { AuthorizeEmployeeManagementUseCase } from "../../application/authorize-employee-management/authorize-employee-management.usecase";
import type { CreateEmployeeUseCase } from "../../application/create-employee/create-employee.usecase";
import type { DeleteEmployeeUseCase } from "../../application/delete-employee/delete-employee.usecase";
import type { GetEmployeeUseCase } from "../../application/get-employee/get-employee.usecase";
import type { ListEmployeesUseCase } from "../../application/list-employees/list-employees.usecase";
import type { UpdateEmployeeUseCase } from "../../application/update-employee/update-employee.usecase";
import { createEmployeeBodySchema } from "./schemas/create-employee.schema";
import { deleteEmployeeResponseSchema } from "./schemas/delete-employee.schema";
import { employeeErrorResponseSchemas } from "./schemas/employee-error.schema";
import { employeeParamsSchema } from "./schemas/employee-params.schema";
import {
  createdEmployeeResponseSchema,
  employeeListResponseSchema,
  updatedEmployeeResponseSchema,
} from "./schemas/employee-response.schema";
import { getEmployeeResponseSchema } from "./schemas/get-employee.schema";
import { listEmployeesQuerySchema } from "./schemas/list-employees.schema";
import { updateEmployeeBodySchema } from "./schemas/update-employee.schema";

export interface EmployeeRouteDependencies {
  authorize: AuthorizeEmployeeManagementUseCase;
  create: CreateEmployeeUseCase;
  delete: DeleteEmployeeUseCase;
  get: GetEmployeeUseCase;
  list: ListEmployeesUseCase;
  update: UpdateEmployeeUseCase;
}

export function employeeRoutes(dependencies: EmployeeRouteDependencies): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.addHook("preHandler", fastify.authenticate);
    fastify.addHook("preHandler", async (request) => {
      await dependencies.authorize.execute({ employeeId: request.user.sub });
    });

    fastify.post(
      "/api/employees",
      {
        schema: {
          tags: ["Employees"],
          body: createEmployeeBodySchema,
          response: { 201: createdEmployeeResponseSchema, ...employeeErrorResponseSchemas },
        },
      },
      async (request, reply) => {
        const employee = await dependencies.create.execute(request.body);
        return reply.status(201).send(employee);
      },
    );

    fastify.get(
      "/api/employees",
      {
        schema: {
          tags: ["Employees"],
          querystring: listEmployeesQuerySchema,
          response: { 200: employeeListResponseSchema, ...employeeErrorResponseSchemas },
        },
      },
      async (request) => dependencies.list.execute(request.query),
    );

    fastify.get(
      "/api/employees/:id",
      {
        schema: {
          tags: ["Employees"],
          params: employeeParamsSchema,
          response: { 200: getEmployeeResponseSchema, ...employeeErrorResponseSchemas },
        },
      },
      async (request) => dependencies.get.execute(request.params),
    );

    fastify.patch(
      "/api/employees/:id",
      {
        schema: {
          tags: ["Employees"],
          params: employeeParamsSchema,
          body: updateEmployeeBodySchema,
          response: { 200: updatedEmployeeResponseSchema, ...employeeErrorResponseSchemas },
        },
      },
      async (request) =>
        dependencies.update.execute({
          ...request.params,
          ...request.body,
          actorId: request.user.sub,
        }),
    );

    fastify.delete(
      "/api/employees/:id",
      {
        schema: {
          tags: ["Employees"],
          params: employeeParamsSchema,
          response: { 200: deleteEmployeeResponseSchema, ...employeeErrorResponseSchemas },
        },
      },
      async (request) => dependencies.delete.execute(request.params),
    );
  };
}
