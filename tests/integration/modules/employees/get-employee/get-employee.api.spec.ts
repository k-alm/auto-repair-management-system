import {
  createEmployeeApiTestApp,
  employeeTestIds,
} from "@tests/support/create-employee-api-test-app";
import { afterEach, describe, expect, it } from "vitest";
import { EmployeeRole } from "@/modules/employees/application/employee-role";

describe("GET /api/employees/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns an employee without the password hash", async () => {
    const { app } = await createEmployeeApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "GET",
      url: `/api/employees/${employeeTestIds.attendant}`,
      headers: { authorization: "Bearer admin" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ role: EmployeeRole.ATTENDANT });
    expect(response.json()).not.toHaveProperty("passwordHash");
  });
});
