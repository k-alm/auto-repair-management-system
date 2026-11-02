import { FakeCustomerRepository } from "@tests/support/fake-customer.repository";
import { describe, expect, it } from "vitest";
import { DeleteCustomerUseCase } from "@/modules/customers/application/delete-customer/delete-customer.usecase";
import { Customer } from "@/modules/customers/domain/entities/customer";
import {
  CustomerHasRelationsError,
  CustomerNotFoundError,
} from "@/modules/customers/domain/errors/customer-errors";

describe("DeleteCustomerUseCase", () => {
  it("deletes a customer without related records", async () => {
    const repository = new FakeCustomerRepository();
    const customer = Customer.create({
      name: "Ana",
      document: "52998224725",
      email: "ana@example.com",
      phone: "11999999999",
    });
    await repository.create(customer);

    await expect(
      new DeleteCustomerUseCase(repository).execute({ id: customer.id }),
    ).resolves.toEqual({ id: customer.id, deleted: true });
    expect(repository.customers.has(customer.id)).toBe(false);
  });

  it("does not delete a customer with related records", async () => {
    const repository = new FakeCustomerRepository();
    const customer = Customer.create({
      name: "Ana",
      document: "52998224725",
      email: "ana@example.com",
      phone: "11999999999",
    });
    await repository.create(customer);
    repository.hasRelatedRecords = true;

    await expect(
      new DeleteCustomerUseCase(repository).execute({ id: customer.id }),
    ).rejects.toBeInstanceOf(CustomerHasRelationsError);
    expect(repository.customers.has(customer.id)).toBe(true);
  });

  it("fails when the customer does not exist", async () => {
    await expect(
      new DeleteCustomerUseCase(new FakeCustomerRepository()).execute({ id: "missing" }),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);
  });
});
