import { afterEach, describe, expect, it } from "vitest";
import { Customer } from "@/modules/customers/domain/entities/customer";
import { createCustomerApiTestApp } from "../support/create-customer-api-test-app";

describe("GET /api/customers", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => close?.());

  it("returns paginated results", async () => {
    const { app, repository } = await createCustomerApiTestApp();
    close = () => app.close();
    await repository.create(
      Customer.create({
        name: "Ana",
        document: "52998224725",
        email: "ana@example.com",
        phone: "11999999999",
      }),
    );

    const response = await app.inject({ method: "GET", url: "/api/customers?page=1&pageSize=10" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ page: 1, pageSize: 10, total: 1 });
  });
});
