import { z } from "zod";

export const customerParamsSchema = z.object({
  id: z.uuid(),
});
