import { z } from "zod";

export const getServiceParamsSchema = z.object({ id: z.uuid() });
