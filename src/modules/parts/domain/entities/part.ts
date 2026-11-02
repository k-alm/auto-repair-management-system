import { randomUUID } from "node:crypto";
import { InvalidPartPriceError } from "../part.errors";

export interface PartProps {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  isActive: boolean;
}

export function normalizePartPrice(price: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) < 0) {
    throw new InvalidPartPriceError();
  }

  return price.includes(".") ? price : `${price}.00`;
}

export class Part {
  private constructor(readonly props: PartProps) {}

  static create(input: Omit<PartProps, "id">) {
    return new Part({
      ...input,
      id: randomUUID(),
      name: input.name.trim(),
      sku: input.sku.trim(),
      price: normalizePartPrice(input.price),
    });
  }

  static restore(input: PartProps) {
    return new Part(input);
  }
}
