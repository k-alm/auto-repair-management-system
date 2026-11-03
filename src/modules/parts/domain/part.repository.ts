import type { Part, PartProps } from "./entities/part";

export interface PartPage {
  items: Part[];
  total: number;
}

export interface PartRepository {
  createPart(part: Part): Promise<Part>;
  findPart(id: string): Promise<Part | null>;
  listParts(input: { skip: number; take: number }): Promise<PartPage>;
  updatePart(id: string, input: Partial<Omit<PartProps, "id">>): Promise<Part>;
  setPartStockQuantity(id: string, stockQuantity: number): Promise<Part>;
  addPartStock(id: string, quantity: number): Promise<Part>;
  deletePart(id: string, preserveUsage: boolean): Promise<void>;
  existsPartUsage(id: string): Promise<boolean>;
  existsSku(sku: string, exceptId?: string): Promise<boolean>;
}
