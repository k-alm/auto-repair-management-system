export interface CreateServiceInput {
  name: string;
  description?: string | null;
  price: string;
  estimatedMinutes: number;
  isActive: boolean;
}
