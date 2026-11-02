import { z } from "zod";

export const approvalPageParamsSchema = z.object({ id: z.uuid() });
