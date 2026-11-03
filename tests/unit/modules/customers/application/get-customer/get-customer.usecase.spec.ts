import { FakeCustomerRepository } from "@tests/support/fake-customer.repository";
import { describe, expect, it } from "vitest";
import { GetCustomerUseCase } from "@/modules/customers/application/get-customer/get-customer.usecase";
import { Customer } from "@/modules/customers/domain/entities/customer";
import { CustomerNotFoundError } from "@/modules/customers/domain/errors/customer-errors";

describe("GetCustomerUseCase", () => {
  it("returns a customer", async () => {
    const repository = new FakeCustomerRepository();
    const customer = Customer.create({
      name: "Ana",
      document: "52998224725",
      email: "ana@example.com",
      phone: "11999999999",
    });
    await repository.create(customer);

    expect(await new GetCustomerUseCase(repository).execute({ id: customer.id })).toMatchObject({
      id: customer.id,
      name: "Ana",
      document: "52998224725",
    });
  });

  it("fails when the customer does not exist", async () => {
    await expect(
      new GetCustomerUseCase(new FakeCustomerRepository()).execute({ id: "missing" }),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);
  });
});
