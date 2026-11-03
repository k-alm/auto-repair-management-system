export interface UpdatePartInput {
  id: string;
  name?: string;
  description?: string | null;
  sku?: string;
  price?: string;
  isActive?: boolean;
}
