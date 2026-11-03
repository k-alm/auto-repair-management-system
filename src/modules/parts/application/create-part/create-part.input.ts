export interface CreatePartInput {
  name: string;
  description?: string | null;
  sku: string;
  price: string;
  isActive: boolean;
  stockQuantity?: number;
}
