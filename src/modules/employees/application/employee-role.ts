export enum EmployeeRole {
  ADMIN = "ADMIN",
  ATTENDANT = "ATTENDANT",
  MECHANIC = "MECHANIC",
}

export function isEmployeeRole(value: unknown): value is EmployeeRole {
  return Object.values(EmployeeRole).some((role) => role === value);
}
