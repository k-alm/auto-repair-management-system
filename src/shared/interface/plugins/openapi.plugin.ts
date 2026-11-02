import swagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

const tags = [
  { name: "Auth", description: "Autenticação" },
  { name: "Employees", description: "Gestão de funcionários (somente ADMIN)" },
];

const openApiPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Auto Repair Management System API",
        description: "API do sistema de gestão da oficina mecânica (MVP).",
        version: "0.1.0",
      },
      tags,
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await fastify.register(scalar, {
    routePrefix: "/docs",
    configuration: {
      pageTitle: "Auto Repair API",
    },
  });
};

export default fp(openApiPlugin, { name: "openapi" });
