import { FakeWorkOrderRepository } from "@tests/support/fake-work-order.repository";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { CreateWorkOrderUseCase } from "@/modules/work-orders/application/create-work-order/create-work-order.usecase";
import { GetWorkOrderUseCase } from "@/modules/work-orders/application/get-work-order/get-work-order.usecase";
import { ListWorkOrdersUseCase } from "@/modules/work-orders/application/list-work-orders/list-work-orders.usecase";
import { TransitionWorkOrderUseCase } from "@/modules/work-orders/application/transition-work-order/transition-work-order.usecase";
import { workOrderRoutes } from "@/modules/work-orders/interface/http/work-orders.routes";
import { errorHandlerPlugin } from "@/shared/interface/errors/error-handler.plugin";

export async function createWorkOrderApiTestApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  const repository = new FakeWorkOrderRepository();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("authenticate", async () => {});

  await app.register(errorHandlerPlugin);
  await app.register(
    workOrderRoutes({
      create: new CreateWorkOrderUseCase(
        repository,
        { create: () => ({ token: "tracking-token", hash: "tracking-hash" }) },
        7,
        "https://api.example.com",
      ),
      get: new GetWorkOrderUseCase(repository),
      list: new ListWorkOrdersUseCase(repository),
      transition: new TransitionWorkOrderUseCase(repository),
    }),
  );
  await app.ready();
  return { app, repository };
}
