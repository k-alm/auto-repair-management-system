import { afterEach, describe, expect, it } from "vitest";
import { Customer } from "@/modules/customers/domain/entities/customer";
import { createCustomerApiTestApp } from "../support/create-customer-api-test-app";

describe("PATCH /api/customers/:id", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("updates a customer", async () => {
    const { app, repository } = await createCustomerApiTestApp();
    close = () => app.close();
    const customer = Customer.create({
      name: "Ana",
      document: "52998224725",
      email: "ana@example.com",
      phone: "11999999999",
    });
    await repository.create(customer);

    const response = await app.inject({
      method: "PATCH",
      url: `/api/customers/${customer.id}`,
      payload: { name: "Ana Silva" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id: customer.id, name: "Ana Silva" });
  });
});
