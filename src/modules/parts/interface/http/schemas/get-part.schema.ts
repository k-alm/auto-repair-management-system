import { z } from "zod";

export const getPartParamsSchema = z.object({ id: z.uuid() });
