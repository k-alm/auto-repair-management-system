import { z } from "zod";

export const NotFoundSchema = z.object({
  error: z.literal("NOT_FOUND"),
  message: z.string(),
});

export const UnauthorizedSchema = z.object({
  error: z.literal("UNAUTHORIZED"),
  message: z.string(),
});

export const ForbiddenSchema = z.object({
  error: z.literal("FORBIDDEN"),
  message: z.string(),
});

export const ConflictSchema = z.object({
  error: z.literal("CONFLICT"),
  message: z.string(),
});

export const UnprocessableSchema = z.object({
  error: z.literal("UNPROCESSABLE"),
  message: z.string(),
});

export const ValidationErrorSchema = z.object({
  error: z.literal("VALIDATION_ERROR"),
  message: z.string(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

export const InternalServerErrorSchema = z.object({
  error: z.literal("INTERNAL_SERVER_ERROR"),
  message: z.string(),
});

export const AnyErrorSchema = z.union([
  NotFoundSchema,
  UnauthorizedSchema,
  ForbiddenSchema,
  ConflictSchema,
  UnprocessableSchema,
  ValidationErrorSchema,
  InternalServerErrorSchema,
]);

export type AppErrorResponse = z.infer<typeof AnyErrorSchema>;

/** 422 pode ser erro de validação do schema OU regra de negócio violada. */
export const Unprocessable422Schema = z.union([ValidationErrorSchema, UnprocessableSchema]);
