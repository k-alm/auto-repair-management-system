import { z } from "zod";
import { EmployeeRole } from "../../../application/employee-role";

export const createEmployeeBodySchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.email(),
  role: z.enum(EmployeeRole),
  password: z.string().min(12),
});
