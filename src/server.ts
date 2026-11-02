import { env } from "@/config/env";
import { buildApp } from "./app";

const fastify = await buildApp();

try {
  const port = env.PORT;
  const host = env.HOST;

  await fastify.listen({ port, host });
  fastify.log.info(`Docs em http://localhost:${port}/docs`);
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
