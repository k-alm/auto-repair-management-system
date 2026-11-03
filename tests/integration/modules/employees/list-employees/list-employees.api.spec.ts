import { createEmployeeApiTestApp } from "@tests/support/create-employee-api-test-app";
import { afterEach, describe, expect, it } from "vitest";
import { EmployeeRole } from "@/modules/employees/application/employee-role";

describe("GET /api/employees", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns paginated employees without password hashes", async () => {
    const { app } = await createEmployeeApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "GET",
      url: "/api/employees?page=1&pageSize=2",
      headers: { authorization: "Bearer admin" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({ role: EmployeeRole.ADMIN }),
        expect.objectContaining({ role: EmployeeRole.ATTENDANT }),
      ]),
      page: 1,
      pageSize: 2,
      total: 3,
    });
    expect(JSON.stringify(response.json())).not.toContain("passwordHash");
    expect(JSON.stringify(response.json())).not.toContain("stored-password-hash");
  });
});
