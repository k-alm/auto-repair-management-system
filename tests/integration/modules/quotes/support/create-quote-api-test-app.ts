import { FakeQuoteRepository } from "@tests/support/fake-quote.repository";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { DecideQuoteUseCase } from "@/modules/quotes/application/decide-quote/decide-quote.usecase";
import { GetQuoteUseCase } from "@/modules/quotes/application/get-quote/get-quote.usecase";
import { SendQuoteUseCase } from "@/modules/quotes/application/send-quote/send-quote.usecase";
import { quoteRoutes } from "@/modules/quotes/interface/http/quotes.routes";
import { errorHandlerPlugin } from "@/shared/interface/errors/error-handler.plugin";

export async function createQuoteApiTestApp() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  const repository = new FakeQuoteRepository();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("authenticate", async () => {});

  await app.register(errorHandlerPlugin);
  await app.register(
    quoteRoutes({
      decide: new DecideQuoteUseCase(repository, { hash: (token) => `hashed:${token}` }),
      get: new GetQuoteUseCase(repository),
      send: new SendQuoteUseCase(
        repository,
        {
          create: () => ({
            token: "approval-token",
            tokenHash: "approval-hash",
            authorizationId: "00000000-0000-4000-8000-000000000003",
          }),
        },
        24,
        "https://api.example.com",
      ),
    }),
  );
  await app.ready();
  return { app, repository };
}
