import { z } from "zod";

export const trackingPageParamsSchema = z.object({ id: z.uuid() });
