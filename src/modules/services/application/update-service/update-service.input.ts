export interface UpdateServiceInput {
  id: string;
  name?: string;
  description?: string | null;
  price?: string;
  estimatedMinutes?: number;
  isActive?: boolean;
}
