import type { CustomerRepository } from "../../domain/customer.repository";
import { CustomerNotFoundError } from "../../domain/errors/customer-errors";
import type { GetCustomerInput } from "./get-customer.input";
import type { GetCustomerResponse } from "./get-customer.response";

export class GetCustomerUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(input: GetCustomerInput): Promise<GetCustomerResponse> {
    const customer = await this.customers.findById(input.id);
    if (!customer) throw new CustomerNotFoundError();

    return {
      id: customer.id,
      name: customer.name,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
