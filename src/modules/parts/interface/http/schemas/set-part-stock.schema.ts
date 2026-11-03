import { z } from "zod";
import { MAX_PART_STOCK_QUANTITY } from "../../../domain/entities/part";

export const setPartStockBodySchema = z.object({
  stockQuantity: z.number().int().nonnegative().max(MAX_PART_STOCK_QUANTITY),
});
