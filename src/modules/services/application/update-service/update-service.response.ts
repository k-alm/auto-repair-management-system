export interface UpdateServiceResponse {
  id: string;
  name: string;
  description: string | null;
  price: string;
  estimatedMinutes: number;
  isActive: boolean;
}
