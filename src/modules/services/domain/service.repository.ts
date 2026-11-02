import type { Service, ServiceProps } from "./entities/service";

export interface ServicePage {
  items: Service[];
  total: number;
}

export interface ServiceRepository {
  createService(service: Service): Promise<Service>;
  findService(id: string): Promise<Service | null>;
  listServices(input: { skip: number; take: number }): Promise<ServicePage>;
  updateService(id: string, input: Partial<Omit<ServiceProps, "id">>): Promise<Service>;
  deleteService(id: string, preserveUsage: boolean): Promise<void>;
  existsServiceUsage(id: string): Promise<boolean>;
}
