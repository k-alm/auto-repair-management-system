import type { CustomerRepository } from "../../domain/customer.repository";
import type { ListCustomersInput } from "./list-customers.input";
import type { ListCustomersResponse } from "./list-customers.response";

export class ListCustomersUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(input: ListCustomersInput): Promise<ListCustomersResponse> {
    const result = await this.customers.list({
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    });

    return {
      items: result.items.map((customer) => ({
        id: customer.id,
        name: customer.name,
        document: customer.document,
        email: customer.email,
        phone: customer.phone,
      })),
      page: input.page,
      pageSize: input.pageSize,
      total: result.total,
    };
  }
}
