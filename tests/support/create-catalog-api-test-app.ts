import { FakeCatalogRepository } from "@tests/support/fake-catalog.repository";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { AddPartStockUseCase } from "@/modules/parts/application/add-part-stock/add-part-stock.usecase";
import { CreatePartUseCase } from "@/modules/parts/application/create-part/create-part.usecase";
import { DeletePartUseCase } from "@/modules/parts/application/delete-part/delete-part.usecase";
import { GetPartUseCase } from "@/modules/parts/application/get-part/get-part.usecase";
import { ListPartsUseCase } from "@/modules/parts/application/list-parts/list-parts.usecase";
import { SetPartStockUseCase } from "@/modules/parts/application/set-part-stock/set-part-stock.usecase";
import { UpdatePartUseCase } from "@/modules/parts/application/update-part/update-part.usecase";
import { partsRoutes } from "@/modules/parts/interface/http/parts.routes";
import { CreateServiceUseCase } from "@/modules/services/application/create-service/create-service.usecase";
import { DeleteServiceUseCase } from "@/modules/services/application/delete-service/delete-service.usecase";
import { GetServiceUseCase } from "@/modules/services/application/get-service/get-service.usecase";
import { ListServicesUseCase } from "@/modules/services/application/list-services/list-services.usecase";
import { UpdateServiceUseCase } from "@/modules/services/application/update-service/update-service.usecase";
import { servicesRoutes } from "@/modules/services/interface/http/services.routes";
import { errorHandlerPlugin } from "@/shared/interface/errors/error-handler.plugin";

export async function createCatalogApiTestApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  const repository = new FakeCatalogRepository();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("authenticate", async () => {});

  await app.register(errorHandlerPlugin);
  await app.register(
    servicesRoutes({
      create: new CreateServiceUseCase(repository),
      delete: new DeleteServiceUseCase(repository),
      get: new GetServiceUseCase(repository),
      list: new ListServicesUseCase(repository),
      update: new UpdateServiceUseCase(repository),
    }),
  );
  await app.register(
    partsRoutes({
      addStock: new AddPartStockUseCase(repository),
      create: new CreatePartUseCase(repository),
      delete: new DeletePartUseCase(repository),
      get: new GetPartUseCase(repository),
      list: new ListPartsUseCase(repository),
      setStock: new SetPartStockUseCase(repository),
      update: new UpdatePartUseCase(repository),
    }),
  );
  await app.ready();

  return { app, repository };
}
