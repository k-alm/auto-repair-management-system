import { afterEach, describe, expect, it } from "vitest";
import { createCustomerApiTestApp } from "../support/create-customer-api-test-app";

describe("POST /api/customers", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("creates a customer and returns HTTP 201", async () => {
    const { app, repository } = await createCustomerApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/customers",
      payload: {
        name: "Ana Silva",
        document: "529.982.247-25",
        email: "ana@example.com",
        phone: "11999999999",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ name: "Ana Silva", document: "52998224725" });
    expect(repository.customers.size).toBe(1);
  });

  it("rejects malformed request fields", async () => {
    const { app, repository } = await createCustomerApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/customers",
      payload: { name: "A", document: "123", email: "invalid", phone: "123" },
    });

    expect(response.statusCode).toBe(422);
    expect(repository.customers.size).toBe(0);
  });

  it("rejects invalid CPF values with HTTP 422", async () => {
    const { app, repository } = await createCustomerApiTestApp();
    close = () => app.close();
    const response = await app.inject({
      method: "POST",
      url: "/api/customers",
      payload: {
        name: "Ana Silva",
        document: "11111111111",
        email: "ana@example.com",
        phone: "11999999999",
      },
    });

    expect(response.statusCode).toBe(422);
    expect(repository.customers.size).toBe(0);
  });
});
