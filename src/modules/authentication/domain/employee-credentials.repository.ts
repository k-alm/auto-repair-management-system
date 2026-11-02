export interface EmployeeCredentials {
  id: string;
  role: string;
  passwordHash: string;
}

export interface EmployeeCredentialsRepository {
  findActiveByEmail(email: string): Promise<EmployeeCredentials | null>;
}
