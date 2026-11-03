import {
  createEmployeeApiTestApp,
  employeeTestIds,
} from "@tests/support/create-employee-api-test-app";
import { afterEach, describe, expect, it } from "vitest";
import { EmployeeRole } from "@/modules/employees/application/employee-role";

describe("PATCH /api/employees/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("updates an employee and omits the password hash", async () => {
    const { app } = await createEmployeeApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "PATCH",
      url: `/api/employees/${employeeTestIds.attendant}`,
      headers: { authorization: "Bearer admin" },
      payload: { name: "Atendente Atualizada", role: EmployeeRole.MECHANIC },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      name: "Atendente Atualizada",
      role: EmployeeRole.MECHANIC,
    });
    expect(response.json()).not.toHaveProperty("passwordHash");
  });

  it("prevents an administrator from changing their own role", async () => {
    const { app } = await createEmployeeApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "PATCH",
      url: `/api/employees/${employeeTestIds.admin}`,
      headers: { authorization: "Bearer admin" },
      payload: { role: EmployeeRole.ATTENDANT },
    });

    expect(response.statusCode).toBe(403);
  });

  it("rejects invalid roles", async () => {
    const { app } = await createEmployeeApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "PATCH",
      url: `/api/employees/${employeeTestIds.attendant}`,
      headers: { authorization: "Bearer admin" },
      payload: { role: "OWNER" },
    });

    expect(response.statusCode).toBe(422);
  });
});
