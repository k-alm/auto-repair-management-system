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
import { AuthorizeEmployeeManagementUseCase } from "./modules/employees/application/authorize-employee-management/authorize-employee-management.usecase";
import { CreateEmployeeUseCase } from "./modules/employees/application/create-employee/create-employee.usecase";
import { DeleteEmployeeUseCase } from "./modules/employees/application/delete-employee/delete-employee.usecase";
import { GetEmployeeUseCase } from "./modules/employees/application/get-employee/get-employee.usecase";
import { ListEmployeesUseCase } from "./modules/employees/application/list-employees/list-employees.usecase";
import { UpdateEmployeeUseCase } from "./modules/employees/application/update-employee/update-employee.usecase";
import { PrismaEmployeeRepository } from "./modules/employees/infrastructure/persistence/prisma-employee.repository";
import { BcryptPasswordHasher } from "./modules/employees/infrastructure/security/bcrypt-password-hasher";
import { AddPartStockUseCase } from "./modules/parts/application/add-part-stock/add-part-stock.usecase";
import { CreatePartUseCase } from "./modules/parts/application/create-part/create-part.usecase";
import { DeletePartUseCase } from "./modules/parts/application/delete-part/delete-part.usecase";
import { GetPartUseCase } from "./modules/parts/application/get-part/get-part.usecase";
import { ListPartsUseCase } from "./modules/parts/application/list-parts/list-parts.usecase";
import { SetPartStockUseCase } from "./modules/parts/application/set-part-stock/set-part-stock.usecase";
import { UpdatePartUseCase } from "./modules/parts/application/update-part/update-part.usecase";
import { PrismaPartRepository } from "./modules/parts/infrastructure/persistence/prisma-part.repository";
import { GetPublicTrackingUseCase } from "./modules/public-tracking/application/get-public-tracking/get-public-tracking.usecase";
import { PrismaTrackingRepository } from "./modules/public-tracking/infrastructure/persistence/prisma-tracking.repository";
import { Sha256TrackingTokenHasher } from "./modules/public-tracking/infrastructure/security/sha256-tracking-token-hasher";
import { DecideQuoteUseCase } from "./modules/quotes/application/decide-quote/decide-quote.usecase";
import { GetQuoteUseCase } from "./modules/quotes/application/get-quote/get-quote.usecase";
import { SendQuoteUseCase } from "./modules/quotes/application/send-quote/send-quote.usecase";
import { PrismaQuoteRepository } from "./modules/quotes/infrastructure/persistence/prisma-quote.repository";
import { OpaqueApprovalCredentialGenerator } from "./modules/quotes/infrastructure/security/opaque-approval-credential-generator";
import { Sha256QuoteTokenHasher } from "./modules/quotes/infrastructure/security/sha256-quote-token-hasher";
import { GetAverageExecutionTimeUseCase } from "./modules/reports/application/get-average-execution-time/get-average-execution-time.usecase";
import { PrismaExecutionTimeRepository } from "./modules/reports/infrastructure/persistence/prisma-execution-time.repository";
import { CreateServiceUseCase } from "./modules/services/application/create-service/create-service.usecase";
import { DeleteServiceUseCase } from "./modules/services/application/delete-service/delete-service.usecase";
import { GetServiceUseCase } from "./modules/services/application/get-service/get-service.usecase";
import { ListServicesUseCase } from "./modules/services/application/list-services/list-services.usecase";
import { UpdateServiceUseCase } from "./modules/services/application/update-service/update-service.usecase";
import { PrismaServiceRepository } from "./modules/services/infrastructure/persistence/prisma-service.repository";
import { CreateVehicleUseCase } from "./modules/vehicles/application/create-vehicle/create-vehicle.usecase";
import { DeleteVehicleUseCase } from "./modules/vehicles/application/delete-vehicle/delete-vehicle.usecase";
import { GetVehicleUseCase } from "./modules/vehicles/application/get-vehicle/get-vehicle.usecase";
import { ListVehiclesUseCase } from "./modules/vehicles/application/list-vehicles/list-vehicles.usecase";
import { UpdateVehicleUseCase } from "./modules/vehicles/application/update-vehicle/update-vehicle.usecase";
import { PrismaVehicleRepository } from "./modules/vehicles/infrastructure/persistence/prisma-vehicle.repository";
import { CreateWorkOrderUseCase } from "./modules/work-orders/application/create-work-order/create-work-order.usecase";
import { GetWorkOrderUseCase } from "./modules/work-orders/application/get-work-order/get-work-order.usecase";
import { ListWorkOrdersUseCase } from "./modules/work-orders/application/list-work-orders/list-work-orders.usecase";
import { TransitionWorkOrderUseCase } from "./modules/work-orders/application/transition-work-order/transition-work-order.usecase";
import { PrismaWorkOrderRepository } from "./modules/work-orders/infrastructure/persistence/prisma-work-order.repository";
import { OpaqueTrackingTokenGenerator } from "./modules/work-orders/infrastructure/security/opaque-tracking-token-generator";
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
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  });
  await fastify.register(rateLimit, { global: false });
  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);
  await fastify.register(corsPlugin);

  const customerRepository = new PrismaCustomerRepository(fastify.prisma);
  const vehicleRepository = new PrismaVehicleRepository(fastify.prisma);
  const executionTimeRepository = new PrismaExecutionTimeRepository(fastify.prisma);
  const employeeRepository = new PrismaEmployeeCredentialsRepository(fastify.prisma);
  const employeeManagementRepository = new PrismaEmployeeRepository(fastify.prisma);
  const serviceRepository = new PrismaServiceRepository(fastify.prisma);
  const partRepository = new PrismaPartRepository(fastify.prisma);
  const workOrderRepository = new PrismaWorkOrderRepository(fastify.prisma);
  const quoteRepository = new PrismaQuoteRepository(fastify.prisma);
  const trackingRepository = new PrismaTrackingRepository(fastify.prisma);
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
    parts: {
      addStock: new AddPartStockUseCase(partRepository),
      create: new CreatePartUseCase(partRepository),
      delete: new DeletePartUseCase(partRepository),
      get: new GetPartUseCase(partRepository),
      list: new ListPartsUseCase(partRepository),
      setStock: new SetPartStockUseCase(partRepository),
      update: new UpdatePartUseCase(partRepository),
    },
    services: {
      create: new CreateServiceUseCase(serviceRepository),
      delete: new DeleteServiceUseCase(serviceRepository),
      get: new GetServiceUseCase(serviceRepository),
      list: new ListServicesUseCase(serviceRepository),
      update: new UpdateServiceUseCase(serviceRepository),
    },
    workOrders: {
      create: new CreateWorkOrderUseCase(
        workOrderRepository,
        new OpaqueTrackingTokenGenerator(),
        env.TRACKING_TOKEN_TTL_DAYS,
        env.PUBLIC_API_URL,
      ),
      get: new GetWorkOrderUseCase(workOrderRepository),
      list: new ListWorkOrdersUseCase(workOrderRepository),
      transition: new TransitionWorkOrderUseCase(workOrderRepository),
    },
    quotes: {
      decide: new DecideQuoteUseCase(quoteRepository, new Sha256QuoteTokenHasher()),
      get: new GetQuoteUseCase(quoteRepository),
      send: new SendQuoteUseCase(
        quoteRepository,
        new OpaqueApprovalCredentialGenerator(),
        env.APPROVAL_TOKEN_TTL_HOURS,
        env.PUBLIC_API_URL,
      ),
    },
    publicTracking: {
      get: new GetPublicTrackingUseCase(trackingRepository, new Sha256TrackingTokenHasher()),
    },
    employees: {
      authorize: new AuthorizeEmployeeManagementUseCase(employeeManagementRepository),
      create: new CreateEmployeeUseCase(employeeManagementRepository, new BcryptPasswordHasher()),
      delete: new DeleteEmployeeUseCase(employeeManagementRepository),
      get: new GetEmployeeUseCase(employeeManagementRepository),
      list: new ListEmployeesUseCase(employeeManagementRepository),
      update: new UpdateEmployeeUseCase(employeeManagementRepository),
    },
  });
  notificationWorker(fastify);

  return fastify;
}
