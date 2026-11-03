import {
  createEmployeeApiTestApp,
  employeeTestIds,
} from "@tests/support/create-employee-api-test-app";
import { afterEach, describe, expect, it } from "vitest";

describe("DELETE /api/employees/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("deletes an employee when requested by an administrator", async () => {
    const { app, repository } = await createEmployeeApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "DELETE",
      url: `/api/employees/${employeeTestIds.mechanic}`,
      headers: { authorization: "Bearer admin" },
    });

    expect(response.statusCode).toBe(204);
    expect(repository.employees.has(employeeTestIds.mechanic)).toBe(false);
  });
});
