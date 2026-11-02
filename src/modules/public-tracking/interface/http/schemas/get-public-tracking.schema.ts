import { z } from "zod";

export const getPublicTrackingParamsSchema = z.object({ id: z.uuid() });
export const getPublicTrackingHeadersSchema = z.object({
  "x-tracking-token": z.string().min(20),
});
export const publicTrackingResponseSchema = z.object({
  id: z.uuid(),
  status: z.string(),
  openedAt: z.date(),
  vehicle: z.object({
    plate: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.number().int(),
  }),
  services: z.array(z.string()),
  startedAt: z.date().nullable(),
  finishedAt: z.date().nullable(),
});
