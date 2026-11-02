import { z } from "zod";

export const getWorkOrderParamsSchema = z.object({ id: z.uuid() });
