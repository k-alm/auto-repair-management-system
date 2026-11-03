import { FakeCustomerRepository } from "@tests/support/fake-customer.repository";
import { describe, expect, it } from "vitest";
import { ListCustomersUseCase } from "@/modules/customers/application/list-customers/list-customers.usecase";
import { Customer } from "@/modules/customers/domain/entities/customer";

describe("ListCustomersUseCase", () => {
  it("returns a page without exposing entity internals", async () => {
    const repository = new FakeCustomerRepository();
    await repository.create(
      Customer.create({
        name: "Ana",
        document: "52998224725",
        email: "ana@example.com",
        phone: "11999999999",
      }),
    );

    const response = await new ListCustomersUseCase(repository).execute({ page: 1, pageSize: 10 });

    expect(response).toMatchObject({
      page: 1,
      pageSize: 10,
      total: 1,
      items: [{ name: "Ana" }],
    });
    expect(response.items[0]).not.toHaveProperty("props");
  });

  it("applies pagination before returning results", async () => {
    const repository = new FakeCustomerRepository();
    for (const [name, document] of [
      ["Ana", "52998224725"],
      ["Bia", "11144477735"],
    ]) {
      await repository.create(
        Customer.create({
          name,
          document,
          email: `${name.toLowerCase()}@example.com`,
          phone: "11999999999",
        }),
      );
    }

    const response = await new ListCustomersUseCase(repository).execute({ page: 2, pageSize: 1 });
    expect(response.items).toHaveLength(1);
    expect(response.page).toBe(2);
  });
});
