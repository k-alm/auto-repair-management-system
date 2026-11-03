import { ConflictError } from "@/shared/domain/errors";
import { WorkOrderStatus } from "./work-order-status";

export const workOrderStatuses = Object.values(WorkOrderStatus);

const transitions: Record<WorkOrderStatus, readonly WorkOrderStatus[]> = {
  [WorkOrderStatus.RECEBIDA]: [WorkOrderStatus.EM_DIAGNOSTICO, WorkOrderStatus.CANCELADA],
  [WorkOrderStatus.EM_DIAGNOSTICO]: [
    WorkOrderStatus.AGUARDANDO_APROVACAO,
    WorkOrderStatus.CANCELADA,
  ],
  [WorkOrderStatus.AGUARDANDO_APROVACAO]: [WorkOrderStatus.EM_EXECUCAO, WorkOrderStatus.CANCELADA],
  [WorkOrderStatus.EM_EXECUCAO]: [WorkOrderStatus.FINALIZADA, WorkOrderStatus.CANCELADA],
  [WorkOrderStatus.FINALIZADA]: [WorkOrderStatus.ENTREGUE],
  [WorkOrderStatus.ENTREGUE]: [],
  [WorkOrderStatus.CANCELADA]: [],
};

export function assertWorkOrderTransition(current: string, next: string) {
  const allowedStatuses = Object.entries(transitions).find(([status]) => status === current)?.[1];

  if (!allowedStatuses?.some((status) => status === next)) {
    throw new ConflictError(`Transição de status inválida: ${current} -> ${next}`);
  }
}

export function calculateQuoteTotal(
  services: { price: string }[],
  parts: { price: string; quantity: number }[],
) {
  const cents = (price: string) => {
    const [whole, fraction = ""] = price.split(".");
    return BigInt(whole ?? "0") * 100n + BigInt(fraction.padEnd(2, "0"));
  };
  const total =
    services.reduce((sum, service) => sum + cents(service.price), 0n) +
    parts.reduce((sum, part) => sum + cents(part.price) * BigInt(part.quantity), 0n);
  const whole = total / 100n;
  const fraction = String(total % 100n).padStart(2, "0");
  return `${whole}.${fraction}`;
}
