import { createEmployeeApiTestApp } from "@tests/support/create-employee-api-test-app";
import { afterEach, describe, expect, it } from "vitest";
import { EmployeeRole } from "@/modules/employees/application/employee-role";

describe("POST /api/employees", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("creates an employee and never returns its password hash", async () => {
    const { app, repository } = await createEmployeeApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/employees",
      headers: { authorization: "Bearer admin" },
      payload: {
        name: "Marina Souza",
        email: "MARINA.SOUZA@example.com",
        role: EmployeeRole.ATTENDANT,
        password: "DemoEmployee#2026",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      name: "Marina Souza",
      email: "marina.souza@example.com",
      role: EmployeeRole.ATTENDANT,
    });
    expect(response.json()).not.toHaveProperty("passwordHash");
    expect(repository.employees.size).toBe(4);
    expect(
      [...repository.employees.values()].find(
        (employee) => employee.email === "marina.souza@example.com",
      )?.passwordHash,
    ).toBe("test-hash:DemoEmployee#2026");
  });

  it("rejects malformed fields and roles outside the enum", async () => {
    const { app, repository } = await createEmployeeApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/employees",
      headers: { authorization: "Bearer admin" },
      payload: {
        name: "A",
        email: "invalid",
        role: "OWNER",
        password: "short",
      },
    });

    expect(response.statusCode).toBe(422);
    expect(repository.employees.size).toBe(3);
  });

  it("rejects duplicate email addresses", async () => {
    const { app, repository } = await createEmployeeApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/employees",
      headers: { authorization: "Bearer admin" },
      payload: {
        name: "Outro Admin",
        email: "admin@example.com",
        role: EmployeeRole.ADMIN,
        password: "DemoEmployee#2026",
      },
    });

    expect(response.statusCode).toBe(409);
    expect(repository.employees.size).toBe(3);
  });

  it("requires authentication and blocks non-admin roles", async () => {
    const { app } = await createEmployeeApiTestApp();
    close = () => app.close();
    const request = {
      method: "POST" as const,
      url: "/api/employees",
      payload: {
        name: "Marina Souza",
        email: "marina.souza@example.com",
        role: EmployeeRole.ATTENDANT,
        password: "DemoEmployee#2026",
      },
    };

    const anonymous = await app.inject(request);
    const attendant = await app.inject({
      ...request,
      headers: { authorization: "Bearer attendant" },
    });
    const mechanic = await app.inject({
      ...request,
      headers: { authorization: "Bearer mechanic" },
    });
    const attendantList = await app.inject({
      method: "GET",
      url: "/api/employees",
      headers: { authorization: "Bearer attendant" },
    });
    const mechanicList = await app.inject({
      method: "GET",
      url: "/api/employees",
      headers: { authorization: "Bearer mechanic" },
    });
    const staleAdminClaim = await app.inject({
      ...request,
      headers: { authorization: "Bearer admin-claim-attendant" },
    });

    expect(anonymous.statusCode).toBe(401);
    expect(attendant.statusCode).toBe(403);
    expect(mechanic.statusCode).toBe(403);
    expect(attendantList.statusCode).toBe(403);
    expect(mechanicList.statusCode).toBe(403);
    expect(staleAdminClaim.statusCode).toBe(403);
  });
});
