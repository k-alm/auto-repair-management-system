import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { DecideQuoteUseCase } from "../../application/decide-quote/decide-quote.usecase";
import type { GetQuoteUseCase } from "../../application/get-quote/get-quote.usecase";
import type { SendQuoteUseCase } from "../../application/send-quote/send-quote.usecase";
import { renderApprovalPage } from "./presenters/approval-page.presenter";
import { approvalPageParamsSchema } from "./schemas/approval-page.schema";
import {
  decideQuoteBodySchema,
  decideQuoteHeadersSchema,
  decideQuoteParamsSchema,
  decideQuoteResponseSchema,
} from "./schemas/decide-quote.schema";
import { getQuoteParamsSchema } from "./schemas/get-quote.schema";
import { quoteResponseSchema } from "./schemas/quote-response.schema";
import { sendQuoteParamsSchema, sendQuoteResponseSchema } from "./schemas/send-quote.schema";

export interface QuoteRouteDependencies {
  decide: DecideQuoteUseCase;
  get: GetQuoteUseCase;
  send: SendQuoteUseCase;
}

export function quoteRoutes(dependencies: QuoteRouteDependencies): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.get(
      "/api/quotes/:id",
      {
        schema: {
          tags: ["Quotes"],
          params: getQuoteParamsSchema,
          security: [{ bearerAuth: [] }],
          response: { 200: quoteResponseSchema },
        },
        preHandler: fastify.authenticate,
      },
      async (request) => dependencies.get.execute(request.params),
    );

    fastify.post(
      "/api/work-orders/:id/quote/send",
      {
        schema: {
          tags: ["Quotes"],
          params: sendQuoteParamsSchema,
          response: { 200: sendQuoteResponseSchema },
        },
        preHandler: fastify.authenticate,
      },
      async (request) =>
        dependencies.send.execute({
          workOrderId: request.params.id,
        }),
    );

    fastify.post(
      "/api/public/quotes/:id/decision",
      {
        schema: {
          tags: ["Public"],
          summary: "Aprova ou rejeita um orçamento com autorização individual",
          security: [],
          params: decideQuoteParamsSchema,
          headers: decideQuoteHeadersSchema,
          body: decideQuoteBodySchema,
          response: { 200: decideQuoteResponseSchema },
        },
        config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      },
      async (request) =>
        dependencies.decide.execute({
          id: request.params.id,
          token: request.headers["x-approval-token"],
          decision: request.body.decision,
        }),
    );

    fastify.get(
      "/api/public/quotes/:id",
      {
        schema: {
          tags: ["Public"],
          summary: "Página segura de decisão do orçamento",
          security: [],
          params: approvalPageParamsSchema,
        },
      },
      async (request, reply) => {
        const { nonce, html } = renderApprovalPage(request.params.id);
        return reply
          .header(
            "Content-Security-Policy",
            `default-src 'none'; script-src 'nonce-${nonce}'; connect-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'`,
          )
          .header("Cache-Control", "no-store")
          .type("text/html; charset=utf-8")
          .send(html);
      },
    );
  };
}
