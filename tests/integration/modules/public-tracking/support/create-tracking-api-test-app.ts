import { FakeTrackingRepository } from "@tests/support/fake-tracking.repository";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { GetPublicTrackingUseCase } from "@/modules/public-tracking/application/get-public-tracking/get-public-tracking.usecase";
import { publicTrackingRoutes } from "@/modules/public-tracking/interface/http/public-tracking.routes";

export async function createTrackingApiTestApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  const repository = new FakeTrackingRepository();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(
    publicTrackingRoutes({
      get: new GetPublicTrackingUseCase(repository, {
        hash: (token) => `hashed:${token}`,
      }),
    }),
  );
  await app.ready();
  return { app, repository };
}
