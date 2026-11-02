export interface CreateWorkOrderInput {
  customerDocument: string;
  vehicleId: string;
  serviceIds: string[];
  parts: { partId: string; quantity: number }[];
}
