import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { LoginUseCase } from "@/modules/authentication/application/login/login.usecase";
import { authenticationRoutes } from "@/modules/authentication/interface/http/authentication.routes";
import type { CustomerRouteDependencies } from "@/modules/customers/interface/http/customers.routes";
import { customerRoutes } from "@/modules/customers/interface/http/customers.routes";
import type { PartRouteDependencies } from "@/modules/parts/interface/http/parts.routes";
import { partsRoutes } from "@/modules/parts/interface/http/parts.routes";
import type { PublicTrackingRouteDependencies } from "@/modules/public-tracking/interface/http/public-tracking.routes";
import { publicTrackingRoutes } from "@/modules/public-tracking/interface/http/public-tracking.routes";
import type { QuoteRouteDependencies } from "@/modules/quotes/interface/http/quotes.routes";
import { quoteRoutes } from "@/modules/quotes/interface/http/quotes.routes";
import type { GetAverageExecutionTimeUseCase } from "@/modules/reports/application/get-average-execution-time/get-average-execution-time.usecase";
import { reportRoutes } from "@/modules/reports/interface/http/reports.routes";
import type { ServiceRouteDependencies } from "@/modules/services/interface/http/services.routes";
import { servicesRoutes } from "@/modules/services/interface/http/services.routes";
import {
  type VehicleRouteDependencies,
  vehicleRoutes,
} from "@/modules/vehicles/interface/http/vehicles.routes";
import type { WorkOrderRouteDependencies } from "@/modules/work-orders/interface/http/work-orders.routes";
import { workOrderRoutes } from "@/modules/work-orders/interface/http/work-orders.routes";

interface RouteDependencies {
  customers: CustomerRouteDependencies;
  vehicles: VehicleRouteDependencies;
  report: GetAverageExecutionTimeUseCase;
  login: LoginUseCase;
  services: ServiceRouteDependencies;
  parts: PartRouteDependencies;
  workOrders: WorkOrderRouteDependencies;
  quotes: QuoteRouteDependencies;
  publicTracking: PublicTrackingRouteDependencies;
}

export const routes: FastifyPluginAsyncZod<RouteDependencies> = async (fastify, dependencies) => {
  await fastify.register(authenticationRoutes(dependencies.login));
  await fastify.register(customerRoutes(dependencies.customers));
  await fastify.register(vehicleRoutes(dependencies.vehicles));
  await fastify.register(servicesRoutes(dependencies.services));
  await fastify.register(partsRoutes(dependencies.parts));
  await fastify.register(workOrderRoutes(dependencies.workOrders));
  await fastify.register(quoteRoutes(dependencies.quotes));
  await fastify.register(publicTrackingRoutes(dependencies.publicTracking));
  await fastify.register(reportRoutes(dependencies.report));
};
