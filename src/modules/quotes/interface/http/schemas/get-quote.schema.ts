import { z } from "zod";

export const getQuoteParamsSchema = z.object({ id: z.uuid() });
