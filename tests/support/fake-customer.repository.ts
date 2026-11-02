import type {
  CustomerPage,
  CustomerRepository,
  CustomerUpdate,
} from "@/modules/customers/domain/customer.repository";
import { Customer } from "@/modules/customers/domain/entities/customer";

export class FakeCustomerRepository implements CustomerRepository {
  readonly customers = new Map<string, Customer>();
  failCreate = false;
  hasRelatedRecords = false;

  async existsByDocument(document: string) {
    return [...this.customers.values()].some((customer) => customer.document === document);
  }

  async findById(id: string) {
    return this.customers.get(id) ?? null;
  }

  async list(input: { skip: number; take: number }): Promise<CustomerPage> {
    const items = [...this.customers.values()].slice(input.skip, input.skip + input.take);
    return { items, total: this.customers.size };
  }

  async create(customer: Customer) {
    if (this.failCreate) throw new Error("storage unavailable");
    this.customers.set(customer.id, customer);
    return customer;
  }

  async update(id: string, input: CustomerUpdate) {
    const customer = this.customers.get(id);
    if (!customer) throw new Error("customer not found");
    const updated = Customer.restore({
      ...customer.props,
      ...input,
      updatedAt: new Date(),
      document: Customer.create({
        name: input.name ?? customer.name,
        document: input.document ?? customer.document,
        email: input.email ?? customer.email,
        phone: input.phone ?? customer.phone,
      }).props.document,
    });
    this.customers.set(id, updated);
    return updated;
  }

  async hasRelations() {
    return this.hasRelatedRecords;
  }

  async delete(id: string) {
    this.customers.delete(id);
  }
}
