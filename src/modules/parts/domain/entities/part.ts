import { randomUUID } from "node:crypto";
import { InvalidPartPriceError, InvalidPartStockQuantityError } from "../part.errors";

export interface PartProps {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  isActive: boolean;
  stockQuantity: number;
}

export const MAX_PART_STOCK_QUANTITY = 2_147_483_647;

export function normalizePartPrice(price: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) < 0) {
    throw new InvalidPartPriceError();
  }

  return price.includes(".") ? price : `${price}.00`;
}

export function normalizePartStockQuantity(stockQuantity: number) {
  if (
    !Number.isInteger(stockQuantity) ||
    stockQuantity < 0 ||
    stockQuantity > MAX_PART_STOCK_QUANTITY
  ) {
    throw new InvalidPartStockQuantityError();
  }

  return stockQuantity;
}

export class Part {
  private constructor(readonly props: PartProps) {}

  static create(input: Omit<PartProps, "id" | "stockQuantity"> & { stockQuantity?: number }) {
    return new Part({
      ...input,
      id: randomUUID(),
      name: input.name.trim(),
      sku: input.sku.trim(),
      price: normalizePartPrice(input.price),
      stockQuantity: normalizePartStockQuantity(input.stockQuantity ?? 0),
    });
  }

  static restore(input: PartProps) {
    return new Part(input);
  }
}
