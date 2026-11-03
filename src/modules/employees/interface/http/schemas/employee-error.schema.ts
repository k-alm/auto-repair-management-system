import { z } from "zod";

export const employeeErrorResponseSchema = z.object({
  error: z.string(),
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

export const employeeErrorResponseSchemas = {
  401: employeeErrorResponseSchema,
  403: employeeErrorResponseSchema,
  404: employeeErrorResponseSchema,
  409: employeeErrorResponseSchema,
  422: employeeErrorResponseSchema,
};
