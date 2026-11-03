import type { CustomerRepository } from "../../domain/customer.repository";
import { Customer } from "../../domain/entities/customer";
import { CustomerAlreadyExistsError } from "../../domain/errors/customer-errors";
import type { CreateCustomerInput } from "./create-customer.input";
import type { CreateCustomerResponse } from "./create-customer.response";

export class CreateCustomerUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(input: CreateCustomerInput): Promise<CreateCustomerResponse> {
    const customer = Customer.create(input);
    if (await this.customers.existsByDocument(customer.document)) {
      throw new CustomerAlreadyExistsError();
    }

    const created = await this.customers.create(customer);
    return {
      id: created.id,
      name: created.name,
      document: created.document,
      email: created.email,
      phone: created.phone,
      createdAt: created.createdAt,
    };
  }
}
