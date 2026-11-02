import { FakeCustomerRepository } from "@tests/support/fake-customer.repository";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { CreateCustomerUseCase } from "@/modules/customers/application/create-customer/create-customer.usecase";
import { DeleteCustomerUseCase } from "@/modules/customers/application/delete-customer/delete-customer.usecase";
import { GetCustomerUseCase } from "@/modules/customers/application/get-customer/get-customer.usecase";
import { ListCustomersUseCase } from "@/modules/customers/application/list-customers/list-customers.usecase";
import { UpdateCustomerUseCase } from "@/modules/customers/application/update-customer/update-customer.usecase";
import { customerRoutes } from "@/modules/customers/interface/http/customers.routes";
import { errorHandlerPlugin } from "@/shared/interface/errors/error-handler.plugin";

export async function createCustomerApiTestApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  const repository = new FakeCustomerRepository();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("authenticate", async () => {});

  await app.register(errorHandlerPlugin);
  await app.register(
    customerRoutes({
      createCustomer: new CreateCustomerUseCase(repository),
      deleteCustomer: new DeleteCustomerUseCase(repository),
      getCustomer: new GetCustomerUseCase(repository),
      listCustomers: new ListCustomersUseCase(repository),
      updateCustomer: new UpdateCustomerUseCase(repository),
    }),
  );
  await app.ready();

  return { app, repository };
}
