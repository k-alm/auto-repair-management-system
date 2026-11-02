import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { LoginUseCase } from "@/modules/authentication/application/login/login.usecase";
import { authenticationRoutes } from "@/modules/authentication/interface/http/authentication.routes";
import type { CustomerRouteDependencies } from "@/modules/customers/interface/http/customers.routes";
import { customerRoutes } from "@/modules/customers/interface/http/customers.routes";
import type { GetAverageExecutionTimeUseCase } from "@/modules/reports/application/get-average-execution-time/get-average-execution-time.usecase";
import { reportRoutes } from "@/modules/reports/interface/http/reports.routes";
import { type VehicleRouteDependencies, vehicleRoutes } from "@/modules/vehicles/interface/http/vehicles.routes";

interface RouteDependencies {
  customers: CustomerRouteDependencies;
  vehicles: VehicleRouteDependencies;
  report: GetAverageExecutionTimeUseCase;
  login: LoginUseCase;
}

export const routes: FastifyPluginAsyncZod<RouteDependencies> = async (fastify, dependencies) => {
  await fastify.register(authenticationRoutes(dependencies.login));
  await fastify.register(customerRoutes(dependencies.customers));
  await fastify.register(vehicleRoutes(dependencies.vehicles));
  await fastify.register(reportRoutes(dependencies.report));
};
