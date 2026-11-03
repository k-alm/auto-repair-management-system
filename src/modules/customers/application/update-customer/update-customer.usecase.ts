import type { CustomerRepository } from "../../domain/customer.repository";
import {
  CustomerAlreadyExistsError,
  CustomerNotFoundError,
} from "../../domain/errors/customer-errors";
import { CustomerDocument } from "../../domain/value-objects/customer-document";
import type { UpdateCustomerInput } from "./update-customer.input";
import type { UpdateCustomerResponse } from "./update-customer.response";

export class UpdateCustomerUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(input: UpdateCustomerInput): Promise<UpdateCustomerResponse> {
    const current = await this.customers.findById(input.id);
    if (!current) throw new CustomerNotFoundError();

    const update = {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.document !== undefined && {
        document: CustomerDocument.create(input.document).value,
      }),
      ...(input.email !== undefined && { email: input.email.trim().toLowerCase() }),
      ...(input.phone !== undefined && { phone: input.phone.trim() }),
    };

    if (
      update.document &&
      update.document !== current.document &&
      (await this.customers.existsByDocument(update.document))
    ) {
      throw new CustomerAlreadyExistsError();
    }

    const customer = await this.customers.update(input.id, update);
    return {
      id: customer.id,
      name: customer.name,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
      updatedAt: customer.updatedAt,
    };
  }
}
