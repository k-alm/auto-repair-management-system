import { randomUUID } from "node:crypto";

export interface EmployeeProps {
  id: string;
  name: string;
  email: string;
  role: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewEmployeeProps {
  name: string;
  email: string;
  role: string;
  passwordHash: string;
}

export class Employee {
  private constructor(readonly props: EmployeeProps) {}

  static create(input: NewEmployeeProps) {
    const now = new Date();

    return new Employee({
      id: randomUUID(),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      passwordHash: input.passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(input: EmployeeProps) {
    return new Employee(input);
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get role() {
    return this.props.role;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
