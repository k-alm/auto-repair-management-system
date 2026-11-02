import type { CustomerRepository } from "../../domain/customer.repository";
import {
  CustomerHasRelationsError,
  CustomerNotFoundError,
} from "../../domain/errors/customer-errors";
import type { DeleteCustomerInput } from "./delete-customer.input";
import type { DeleteCustomerResponse } from "./delete-customer.response";

export class DeleteCustomerUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(input: DeleteCustomerInput): Promise<DeleteCustomerResponse> {
    if (!(await this.customers.findById(input.id))) throw new CustomerNotFoundError();
    if (await this.customers.hasRelations(input.id)) throw new CustomerHasRelationsError();
    await this.customers.delete(input.id);
    return { id: input.id, deleted: true };
  }
}
