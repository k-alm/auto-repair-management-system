export interface UpdatePartResponse {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  isActive: boolean;
}
