import { randomUUID } from "node:crypto";
import { CustomerDocument } from "../value-objects/customer-document";

export interface CustomerProps {
  id: string;
  name: string;
  document: CustomerDocument;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewCustomerProps {
  name: string;
  document: string;
  email: string;
  phone: string;
}

export class Customer {
  private constructor(readonly props: CustomerProps) {}

  static create(input: NewCustomerProps) {
    const now = new Date();
    return new Customer({
      id: randomUUID(),
      name: input.name.trim(),
      document: CustomerDocument.create(input.document),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(input: CustomerProps) {
    return new Customer(input);
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get document() {
    return this.props.document.value;
  }
  get email() {
    return this.props.email;
  }
  get phone() {
    return this.props.phone;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
