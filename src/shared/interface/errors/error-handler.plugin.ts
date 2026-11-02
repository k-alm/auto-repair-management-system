import type { FastifyPluginCallback } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { AppError } from "@/shared/domain/errors/app.error";

const errorHandlerPlugin: FastifyPluginCallback = (app, _opts, done) => {
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: "NOT_FOUND",
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  app.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const details = error.validation.map((e) => ({
        field: e.instancePath.replace(/^\/|\/$/g, "").replaceAll("/", ".") || "(root)",
        message: e.message ?? "Invalid value",
      }));

      return reply.status(422).send({
        error: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
      });
    }

    const httpError = error as {
      statusCode?: number;
      message?: string;
    };

    if (
      typeof httpError.statusCode === "number" &&
      httpError.statusCode >= 400 &&
      httpError.statusCode < 500
    ) {
      let code = "BAD_REQUEST";

      switch (httpError.statusCode) {
        case 401:
          code = "UNAUTHORIZED";
          break;
        case 429:
          code = "TOO_MANY_REQUESTS";
          break;
      }

      return reply.status(httpError.statusCode).send({
        error: code,
        message: httpError.message || "An error occurred",
      });
    }

    request.log.error({ err: error }, "Unexpected error");

    return reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    });
  });

  done();
};

export { errorHandlerPlugin };
