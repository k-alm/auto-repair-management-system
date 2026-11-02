import { FakeCustomerRepository } from "@tests/support/fake-customer.repository";
import { describe, expect, it, vi } from "vitest";
import { CreateCustomerUseCase } from "@/modules/customers/application/create-customer/create-customer.usecase";
import { Customer } from "@/modules/customers/domain/entities/customer";
import {
  CustomerAlreadyExistsError,
  InvalidCustomerDocumentError,
} from "@/modules/customers/domain/errors/customer-errors";

const validInput = {
  name: " Ana Silva ",
  document: "529.982.247-25",
  email: " ANA@EXAMPLE.COM ",
  phone: " (11) 99999-9999 ",
};

describe("CreateCustomerUseCase", () => {
  it("creates a customer and returns only its creation response", async () => {
    const repository = new FakeCustomerRepository();
    const response = await new CreateCustomerUseCase(repository).execute(validInput);

    expect(response).toEqual({
      id: expect.any(String),
      name: "Ana Silva",
      document: "52998224725",
      email: "ana@example.com",
      phone: "(11) 99999-9999",
      createdAt: expect.any(Date),
    });
    expect(repository.customers.size).toBe(1);
  });

  it("rejects an invalid document without querying or creating", async () => {
    const repository = new FakeCustomerRepository();
    const exists = vi.spyOn(repository, "existsByDocument");

    await expect(
      new CreateCustomerUseCase(repository).execute({
        ...validInput,
        document: "11111111111",
      }),
    ).rejects.toBeInstanceOf(InvalidCustomerDocumentError);
    expect(exists).not.toHaveBeenCalled();
    expect(repository.customers.size).toBe(0);
  });

  it("rejects a duplicate document without creating", async () => {
    const repository = new FakeCustomerRepository();
    await repository.create(Customer.create(validInput));

    await expect(new CreateCustomerUseCase(repository).execute(validInput)).rejects.toBeInstanceOf(
      CustomerAlreadyExistsError,
    );
    expect(repository.customers.size).toBe(1);
  });

  it("propagates persistence errors", async () => {
    const repository = new FakeCustomerRepository();
    repository.failCreate = true;

    await expect(new CreateCustomerUseCase(repository).execute(validInput)).rejects.toThrow(
      "storage unavailable",
    );
  });
});
