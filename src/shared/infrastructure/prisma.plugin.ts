import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { env } from "@/config/env";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  const prisma = new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    fastify.log.info("PostgreSQL conectado");

    fastify.decorate("prisma", prisma);

    fastify.addHook("onClose", async () => {
      await prisma.$disconnect();
    });
  } catch (error) {
    await prisma.$disconnect();
    fastify.log.error(error, "Falha ao conectar ao PostgreSQL");
    throw error;
  }
};

export default fp(prismaPlugin, { name: "prisma" });
