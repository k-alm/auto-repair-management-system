import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { errorHandlerPlugin } from "./shared/interface/errors/error-handler.plugin";
import openApiPlugin from "./shared/interface/plugins/openapi.plugin";
import { routes } from "./shared/interface/routes";

export async function buildApp() {
  const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(errorHandlerPlugin);
  await fastify.register(openApiPlugin);
  // await fastify.register(prismaPlugin);
  // await fastify.register(corsPlugin);

  await fastify.register(routes);

  return fastify;
}
