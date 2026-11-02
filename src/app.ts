import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./config/env";
import { LoginUseCase } from "./modules/authentication/application/login/login.usecase";
import { PrismaEmployeeCredentialsRepository } from "./modules/authentication/infrastructure/persistence/prisma-employee-credentials.repository";
import { BcryptPasswordVerifier } from "./modules/authentication/infrastructure/security/bcrypt-password-verifier";
import { JwtAccessTokenIssuer } from "./modules/authentication/infrastructure/security/jwt-access-token-issuer";
import { CreateCustomerUseCase } from "./modules/customers/application/create-customer/create-customer.usecase";
import { DeleteCustomerUseCase } from "./modules/customers/application/delete-customer/delete-customer.usecase";
import { GetCustomerUseCase } from "./modules/customers/application/get-customer/get-customer.usecase";
import { ListCustomersUseCase } from "./modules/customers/application/list-customers/list-customers.usecase";
import { UpdateCustomerUseCase } from "./modules/customers/application/update-customer/update-customer.usecase";
import { PrismaCustomerRepository } from "./modules/customers/infrastructure/persistence/prisma-customer.repository";
import { GetAverageExecutionTimeUseCase } from "./modules/reports/application/get-average-execution-time/get-average-execution-time.usecase";
import { PrismaExecutionTimeRepository } from "./modules/reports/infrastructure/persistence/prisma-execution-time.repository";
import { CreateVehicleUseCase } from "./modules/vehicles/application/create-vehicle/create-vehicle.usecase";
import { DeleteVehicleUseCase } from "./modules/vehicles/application/delete-vehicle/delete-vehicle.usecase";
import { GetVehicleUseCase } from "./modules/vehicles/application/get-vehicle/get-vehicle.usecase";
import { ListVehiclesUseCase } from "./modules/vehicles/application/list-vehicles/list-vehicles.usecase";
import { UpdateVehicleUseCase } from "./modules/vehicles/application/update-vehicle/update-vehicle.usecase";
import { PrismaVehicleRepository } from "./modules/vehicles/infrastructure/persistence/prisma-vehicle.repository";
import authPlugin from "./shared/infrastructure/auth.plugin";
import corsPlugin from "./shared/infrastructure/cors.plugin";
import { notificationWorker } from "./shared/infrastructure/notification-worker";
import prismaPlugin from "./shared/infrastructure/prisma.plugin";
import { errorHandlerPlugin } from "./shared/interface/errors/error-handler.plugin";
import openApiPlugin from "./shared/interface/plugins/openapi.plugin";
import { routes } from "./shared/interface/routes";

export async function buildApp() {
  const fastify = Fastify({ logger: env.NODE_ENV !== "test" }).withTypeProvider<ZodTypeProvider>();

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(errorHandlerPlugin);
  await fastify.register(openApiPlugin);
  await fastify.register(helmet);
  await fastify.register(rateLimit, { global: false });
  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);
  await fastify.register(corsPlugin);

  const customerRepository = new PrismaCustomerRepository(fastify.prisma);
  const vehicleRepository = new PrismaVehicleRepository(fastify.prisma);
  const executionTimeRepository = new PrismaExecutionTimeRepository(fastify.prisma);
  const employeeRepository = new PrismaEmployeeCredentialsRepository(fastify.prisma);
  await fastify.register(routes, {
    customers: {
      createCustomer: new CreateCustomerUseCase(customerRepository),
      deleteCustomer: new DeleteCustomerUseCase(customerRepository),
      getCustomer: new GetCustomerUseCase(customerRepository),
      listCustomers: new ListCustomersUseCase(customerRepository),
      updateCustomer: new UpdateCustomerUseCase(customerRepository),
    },
    vehicles: {
      createVehicle: new CreateVehicleUseCase(vehicleRepository),
      deleteVehicle: new DeleteVehicleUseCase(vehicleRepository),
      getVehicle: new GetVehicleUseCase(vehicleRepository),
      listVehicles: new ListVehiclesUseCase(vehicleRepository),
      updateVehicle: new UpdateVehicleUseCase(vehicleRepository),
    },
    report: new GetAverageExecutionTimeUseCase(executionTimeRepository),
    login: new LoginUseCase(
      employeeRepository,
      new BcryptPasswordVerifier(),
      new JwtAccessTokenIssuer((payload) => fastify.jwt.sign(payload)),
      env.JWT_EXPIRES_IN,
    ),
  });
  notificationWorker(fastify);

  return fastify;
}
