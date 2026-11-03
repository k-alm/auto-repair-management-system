import { afterEach, describe, expect, it } from "vitest";
import { Customer } from "@/modules/customers/domain/entities/customer";
import { createCustomerApiTestApp } from "../support/create-customer-api-test-app";

describe("DELETE /api/customers/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("deletes an unreferenced customer with HTTP 204", async () => {
    const { app, repository } = await createCustomerApiTestApp();
    close = () => app.close();
    const customer = Customer.create({
      name: "Ana",
      document: "52998224725",
      email: "ana@example.com",
      phone: "11999999999",
    });
    await repository.create(customer);

    const response = await app.inject({ method: "DELETE", url: `/api/customers/${customer.id}` });
    expect(response.statusCode).toBe(204);
    expect(repository.customers.has(customer.id)).toBe(false);
  });
});
