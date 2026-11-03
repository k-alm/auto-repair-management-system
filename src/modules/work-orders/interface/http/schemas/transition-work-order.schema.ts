import { z } from "zod";
import { WorkOrderStatus } from "../../../domain/work-order-status";

export const transitionWorkOrderBodySchema = z.object({
  to: z.enum([
    WorkOrderStatus.EM_DIAGNOSTICO,
    WorkOrderStatus.FINALIZADA,
    WorkOrderStatus.ENTREGUE,
    WorkOrderStatus.CANCELADA,
  ]),
});
