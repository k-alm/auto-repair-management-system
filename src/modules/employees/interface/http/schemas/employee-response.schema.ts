import { z } from "zod";
import { EmployeeRole } from "../../../application/employee-role";

export const employeeResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: z.enum(EmployeeRole),
});

export const createdEmployeeResponseSchema = employeeResponseSchema.extend({
  createdAt: z.date(),
});

export const employeeDetailResponseSchema = employeeResponseSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updatedEmployeeResponseSchema = employeeResponseSchema.extend({
  updatedAt: z.date(),
});

export const employeeListResponseSchema = z.object({
  items: z.array(employeeResponseSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
