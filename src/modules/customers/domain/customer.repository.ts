import type { Customer } from "./entities/customer";

export interface CustomerUpdate {
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
}

export interface CustomerPage {
  items: Customer[];
  total: number;
}

export interface CustomerRepository {
  existsByDocument(document: string): Promise<boolean>;
  findById(id: string): Promise<Customer | null>;
  list(input: { skip: number; take: number }): Promise<CustomerPage>;
  create(customer: Customer): Promise<Customer>;
  update(id: string, input: CustomerUpdate): Promise<Customer>;
  hasRelations(id: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
