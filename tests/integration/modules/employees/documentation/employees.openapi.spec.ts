import { createEmployeeApiTestApp } from "@tests/support/create-employee-api-test-app";
import { afterEach, describe, expect, it } from "vitest";

describe("Employee OpenAPI documentation", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("documents employee endpoints without demo seed examples", async () => {
    const { app } = await createEmployeeApiTestApp();
    close = () => app.close();
    const definition = JSON.stringify(app.swagger());

    expect(definition).toContain("/api/employees");
    expect(definition).toContain("ADMIN");
    expect(definition).not.toContain("Marina Souza");
    expect(definition).not.toContain("DemoEmployee#2026");
  });
});
