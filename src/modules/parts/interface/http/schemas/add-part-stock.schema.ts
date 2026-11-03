import { z } from "zod";
import { MAX_PART_STOCK_QUANTITY } from "../../../domain/entities/part";

export const addPartStockBodySchema = z.object({
  quantity: z.number().int().positive().max(MAX_PART_STOCK_QUANTITY),
});
