import { z } from "zod";

export const transitionWorkOrderBodySchema = z.object({
  to: z.enum(["EM_DIAGNOSTICO", "FINALIZADA", "ENTREGUE", "CANCELADA"]),
});
