import { FakeCustomerRepository } from "@tests/support/fake-customer.repository";
import { describe, expect, it } from "vitest";
import { UpdateCustomerUseCase } from "@/modules/customers/application/update-customer/update-customer.usecase";
import { Customer } from "@/modules/customers/domain/entities/customer";
import {
  CustomerAlreadyExistsError,
  CustomerNotFoundError,
  InvalidCustomerDocumentError,
} from "@/modules/customers/domain/errors/customer-errors";

describe("UpdateCustomerUseCase", () => {
  it("updates and normalizes supplied fields", async () => {
    const repository = new FakeCustomerRepository();
    const customer = Customer.create({
      name: "Ana",
      document: "52998224725",
      email: "ana@example.com",
      phone: "11999999999",
    });
    await repository.create(customer);

    const result = await new UpdateCustomerUseCase(repository).execute({
      id: customer.id,
      name: " Ana Silva ",
      email: " ANA@EXAMPLE.COM ",
    });

    expect(result).toMatchObject({ id: customer.id, name: "Ana Silva", email: "ana@example.com" });
  });

  it("rejects a document already used by another customer", async () => {
    const repository = new FakeCustomerRepository();
    const customer = Customer.create({
      name: "Ana",
      document: "52998224725",
      email: "ana@example.com",
      phone: "11999999999",
    });
    await repository.create(customer);
    await repository.create(
      Customer.create({
        name: "Bia",
        document: "11144477735",
        email: "bia@example.com",
        phone: "11999999999",
      }),
    );

    await expect(
      new UpdateCustomerUseCase(repository).execute({
        id: customer.id,
        document: "11144477735",
      }),
    ).rejects.toBeInstanceOf(CustomerAlreadyExistsError);
  });

  it("rejects invalid documents and missing customers", async () => {
    const repository = new FakeCustomerRepository();
    const customer = Customer.create({
      name: "Ana",
      document: "52998224725",
      email: "ana@example.com",
      phone: "11999999999",
    });
    await repository.create(customer);

    await expect(
      new UpdateCustomerUseCase(repository).execute({
        id: customer.id,
        document: "123",
      }),
    ).rejects.toBeInstanceOf(InvalidCustomerDocumentError);
    await expect(
      new UpdateCustomerUseCase(repository).execute({ id: "missing", name: "Bia" }),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);
  });
});
