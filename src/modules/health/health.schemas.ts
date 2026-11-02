import { z } from "zod/v4";

const HealthResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  timestamp: z.iso.datetime(),
  database: z.enum(["ok", "unreachable"]),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const healthSchema = {
  tags: ["Health"],
  summary: "Health check",
  description: "Returns API and database connectivity status.",
  response: {
    200: HealthResponseSchema,
    503: HealthResponseSchema,
  },
};
