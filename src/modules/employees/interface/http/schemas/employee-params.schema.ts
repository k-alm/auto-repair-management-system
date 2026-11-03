import { z } from "zod";

export const employeeParamsSchema = z.object({
  id: z.uuid(),
});
