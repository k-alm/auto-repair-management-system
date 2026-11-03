import { z } from "zod";

export const deleteEmployeeResponseSchema = z.object({
  id: z.uuid(),
  deleted: z.literal(true),
});
