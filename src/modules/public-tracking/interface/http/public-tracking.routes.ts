import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { GetPublicTrackingUseCase } from "../../application/get-public-tracking/get-public-tracking.usecase";
import { renderTrackingPage } from "./presenters/tracking-page.presenter";
import {
  getPublicTrackingHeadersSchema,
  getPublicTrackingParamsSchema,
  publicTrackingResponseSchema,
} from "./schemas/get-public-tracking.schema";
import { trackingPageParamsSchema } from "./schemas/tracking-page.schema";

export interface PublicTrackingRouteDependencies {
  get: GetPublicTrackingUseCase;
}

export function publicTrackingRoutes(
  dependencies: PublicTrackingRouteDependencies,
): FastifyPluginAsyncZod {
  return async (fastify) => {
    fastify.get(
      "/api/public/work-orders/:id",
      {
        schema: {
          tags: ["Public"],
          summary: "Consulta o acompanhamento autorizado de uma ordem",
          security: [],
          params: getPublicTrackingParamsSchema,
          headers: getPublicTrackingHeadersSchema,
          response: { 200: publicTrackingResponseSchema },
        },
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      },
      async (request) =>
        dependencies.get.execute({
          id: request.params.id,
          token: request.headers["x-tracking-token"],
        }),
    );

    fastify.get(
      "/api/public/work-orders/:id/track",
      {
        schema: {
          tags: ["Public"],
          summary: "Página segura de acompanhamento da ordem de serviço",
          security: [],
          params: trackingPageParamsSchema,
        },
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      },
      async (request, reply) => {
        const { nonce, html } = renderTrackingPage(request.params.id);
        return reply
          .header(
            "Content-Security-Policy",
            `default-src 'none'; script-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'`,
          )
          .header("Cache-Control", "no-store")
          .type("text/html; charset=utf-8")
          .send(html);
      },
    );
  };
}
