import { ConflictError } from "@/shared/domain/errors";

export const workOrderStatuses = [
  "RECEBIDA",
  "EM_DIAGNOSTICO",
  "AGUARDANDO_APROVACAO",
  "EM_EXECUCAO",
  "FINALIZADA",
  "ENTREGUE",
  "CANCELADA",
] as const;

const transitions: Record<string, readonly string[]> = {
  RECEBIDA: ["EM_DIAGNOSTICO", "CANCELADA"],
  EM_DIAGNOSTICO: ["AGUARDANDO_APROVACAO", "CANCELADA"],
  AGUARDANDO_APROVACAO: ["EM_EXECUCAO", "CANCELADA"],
  EM_EXECUCAO: ["FINALIZADA", "CANCELADA"],
  FINALIZADA: ["ENTREGUE"],
  ENTREGUE: [],
  CANCELADA: [],
};

export function assertWorkOrderTransition(current: string, next: string) {
  if (!transitions[current]?.includes(next)) {
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
