import { randomUUID } from "node:crypto";
import { InvalidServicePriceError } from "../service.errors";

export interface ServiceProps {
  id: string;
  name: string;
  description: string | null;
  price: string;
  estimatedMinutes: number;
  isActive: boolean;
}

export function normalizeServicePrice(price: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) < 0) {
    throw new InvalidServicePriceError();
  }

  return price.includes(".") ? price : `${price}.00`;
}

export class Service {
  private constructor(readonly props: ServiceProps) {}

  static create(input: Omit<ServiceProps, "id">) {
    return new Service({
      ...input,
      id: randomUUID(),
      name: input.name.trim(),
      price: normalizeServicePrice(input.price),
    });
  }

  static restore(input: ServiceProps) {
    return new Service(input);
  }
}
