import { z } from "zod";
import { EmployeeRole } from "../../../application/employee-role";

export const updateEmployeeBodySchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    email: z.email(),
    role: z.enum(EmployeeRole),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });
